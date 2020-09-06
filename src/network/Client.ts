import { IAddress, IClientArgs, Packets, Protocol, DummyAddress, IBundledPacket, PlayStatusType, ResourcePackResponseStatus, PlayerPosition, AdventureSettingsFlag, PlayerPermissions, CommandPermissions } from '../types'
import Logger from '@bwatton/logger'
import { PacketData, BitFlag } from './PacketData'
import { PacketBundle } from './raknet/PacketBundle'
import { ConnectionRequest, ACK, NAK } from './raknet'
import { BundledPacket } from './raknet/BundledPacket'
import { Socket } from 'dgram'
import { Server } from '../Server'
import { ConnectionRequestAccepted } from './raknet/ConnectionRequestAccepted'
import { NewIncomingConnection } from './raknet/NewIncomingConnection'
import { PacketBatch } from './bedrock/PacketBatch'
import {
  Disconnect,
  ResourcePacksInfo,
  Login,
  ResourcePacksStack,
  PlayStatus,
  ResourcePacksResponse,
  StartGame,
  EntityDefinitionList,
  BiomeDefinitionList,
  UpdateAttributes,
  AvailableCommands,
  AdventureSettings,
  EntityNotification,
} from './bedrock'
import { ConnectedPing } from './raknet/ConnectedPing'
import { ConnectedPong } from './raknet/ConnectedPong'
import { PartialPacket } from './custom'
import { BatchedPacket } from './bedrock/BatchedPacket'
import { Reliability } from '../utils'
import { Player } from '../Player'
import { InventoryNotification } from './bedrock/InventoryNotification'

interface SplitQueue {
  [splitId: number]: BundledPacket<any>,
}

export class Client {

  private logger: Logger = new Logger('Client')

  public id: bigint
  public mtuSize: number

  public address: IAddress
  public socket: Socket

  // private splitQueue: Map<number, BundledPacket<any>> = new Map()
  private splitQueue: SplitQueue = {}

  public sequenceNumber = -1

  private player!: Player

  constructor({ id, address, socket, mtuSize }: IClientArgs) {
    this.id = id
    this.address = address
    this.socket = socket
    this.mtuSize = mtuSize

    this.logger.info('Created for', `${address.ip}:${address.port}`)
  }

  public disconnect(message: string, hideScreen = false): void {
    this.send(new Disconnect({
      hideScreen,
      message,
    }))

    this.destroy()
  }

  private destroy() {
    Server.current.removeClient(this.address)
  }

  public handlePacket(data: PacketData): void {
    const flags = data.readByte(false)

    if(flags & BitFlag.ACK) {
      console.log('GOT ACK')
    } else if(flags & BitFlag.NAK) {
      const { props: { sequences } } = new NAK().parse(data)
      console.log('GOT NAK', sequences)
    } else {
      const { packets, sequenceNumber } = new PacketBundle().decode(data)

      this.sendACK(sequenceNumber)

      for(const packet of packets) {
        this.handleBundledPacket(packet)
      }
    }
  }

  private handleBundledPacket(packet: BundledPacket<any>) {
    const props = packet.props as IBundledPacket
    if(props.hasSplit && !packet.hasBeenProcessed) {
      if(props.splitIndex === 0) {
        this.logger.debug(`Initial split packet for ${packet.data.buf[0]}`, packet)
        packet.data.pos = packet.data.length
        this.splitQueue[props.splitId] = packet
        // this.splitQueue.set(props.splitId, packet)
      } else {
        const queue = this.splitQueue[props.splitId]
        this.logger.debug(`Split packet ${props.splitIndex + 1}/${props.splitCount}`)
        // const bundled = this.splitQueue.get(props.splitId)

        if(!queue) {
          throw new Error(`Invalid Split ID: ${props.splitId} for packet: ${packet.id}`)
        } else {
          queue.append(packet.data)

          if(props.splitIndex === props.splitCount - 1) {
            queue.data.pos = 0
            queue.decode()
            queue.hasBeenProcessed = true
            this.handleBundledPacket(queue)
            delete this.splitQueue[props.splitId]
          }
        }
      }
    } else {
      switch(packet.id) {
        case Packets.CONNECTION_REQUEST:
          this.handleConnectionRequest(packet as ConnectionRequest)
          break
        case Packets.NEW_INCOMING_CONNECTION:
          this.handleNewIncomingConnection(packet as NewIncomingConnection)
          break
        case Packets.PACKET_BATCH:
          this.handlePacketBatch(packet as PacketBatch)
          break
        case Packets.DISCONNECTION_NOTIFICATION:
          this.logger.info('Client disconnected, destroying...')
          this.destroy()
          break
        case Packets.CONNECTED_PING:
          this.handleConnectedPing(packet as ConnectedPing)
          break
        default:
          this.logger.debug(`Unknown packet: ${packet.id}`)
      }
    }
  }

  private sendACK(sequenceNumber: number) {
    Server.current.send({
      packet: new ACK([sequenceNumber]),
      socket: this.socket,
      address: this.address,
    })
  }

  private send(packet: BundledPacket<any>, sequenceNumber = ++this.sequenceNumber) {
    Server.current.send({
      packet: new PacketBundle({
        sequenceNumber,
        packets: [packet],
      }),
      socket: this.socket,
      address: this.address,
    })
  }

  // TODO: Add client ticks and send queue
  private sendBatched(packet: BatchedPacket<any>, sequenceNumber?: number) {
    this.send(new PacketBatch({
      packets: [packet],
      reliability: Reliability.ReliableOrdered,
    }), sequenceNumber)
  }

  private sendBatchedMulti(packets: BatchedPacket<any>[], sequenceNumber?: number) {
    this.send(new PacketBatch({ packets }), sequenceNumber)
  }

  private handleConnectedPing(packet: ConnectedPing) {
    const { time } = packet.props

    this.send(new ConnectedPong({
      pingTime: time,
      pongTime: time + 1n,
    }))
  }

  private handleConnectionRequest(packet: ConnectionRequest) {
    this.send(new ConnectionRequestAccepted({
      address: this.address,
      systemIndex: 0,
      systemAddresses: new Array<IAddress>(Protocol.SYSTEM_ADDRESSES).fill(DummyAddress),
      requestTime: packet.props.sendPingTime,
      time: Server.current.runningTime,
    }))
  }

  private handlePacketBatch(packet: PacketBatch) {
    if(!(packet instanceof PartialPacket)) {
      const { packets } = packet.props

      for(const pk of packets) {
        switch(pk.id) {
          case Packets.LOGIN:
            this.handleLogin(pk)
            break
          case Packets.RESOURCE_PACKS_RESPONSE:
            this.handleResourcePacksResponse(pk)
            break
          default:
            this.logger.debug(`UNKNOWN BATCHED PACKET ${pk.id}`)
        }
      }
    }
  }

  private handleNewIncomingConnection(packet: NewIncomingConnection) {
    console.log('nic', packet.props)
  }

  private handleLogin(packet: Login) {
    // TODO: Login verification, already logged in?, ...

    const { clientUUID, XUID, displayName } = packet.props

    this.player = new Player(displayName)
    this.initPlayerListeners()

    // TODO: Actually implement packs
    this.sendBatchedMulti([
      new PlayStatus({
        status: PlayStatusType.SUCCESS,
      }),
      new ResourcePacksInfo({
        mustAccept: false,
        hasScripts: false,
        behaviourPacks: [],
        resourcePacks: [],
      }),
    ])
  }

  private handleResourcePacksResponse(packet: ResourcePacksResponse) {
    const { packIds, status } = packet.props
    this.logger.debug(`Got resource pack status: ${packet.props.status}`, packet.props.packIds)

    // TODO: Implement other statuses
    switch(status) {
      case ResourcePackResponseStatus.HAVE_ALL_PACKS:
        this.sendBatched(new ResourcePacksStack({
          mustAccept: false,
          behaviourPacks: [],
          resourcePacks: [],
          experimental: false,
          gameVersion: Protocol.BEDROCK_VERSION,
        }))
        break
      case ResourcePackResponseStatus.COMPLETED:
        this.completeLogin()
        break
      default:
        this.logger.error(`Unknown ResourcePackResponseStatus: ${status}`)
    }
  }

  private completeLogin() {
    this.sendBatched(new StartGame({
      entityUniqueId: this.player.id,
      entityRuntimeId: this.player.id,
      playerPosition: new PlayerPosition(0, 0, 0, 0, 0),
    }))

    this.logger.debug('Sending EntityDefinitionList:', this.sequenceNumber + 1)
    this.sendBatched(new EntityDefinitionList())
    // this.logger.debug('Sending BiomeDefinitionList:', this.sequenceNumber + 1)
    // this.sendBatched(new BiomeDefinitionList())

    this.sendAttributes(true)

    // TODO: Name tag visible, can climb, immobile
    // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/Player.php#L2255

    Server.logger.info(`${this.player.name} logged in from ${this.address.ip}:${this.address.port}`)

    this.sendBatched(new AvailableCommands())

    this.sendBatched(new AdventureSettings({
      flags: [
        [AdventureSettingsFlag.WORLD_IMMUTABLE, this.player.isSpectator()],
        [AdventureSettingsFlag.NO_PVP, this.player.isSpectator()],
        [AdventureSettingsFlag.AUTO_JUMP, this.player.autoJump],
        [AdventureSettingsFlag.ALLOW_FLIGHT, this.player.allowFlight],
        [AdventureSettingsFlag.NO_CLIP, this.player.isSpectator()], // TODO: Disable?
        [AdventureSettingsFlag.FLYING, this.player.flying],
      ],
      commandPermission: CommandPermissions.NORMAL,
      playerPermission: PlayerPermissions.MEMBER,
      entityUniqueId: this.player.id,
    }))

    // TODO: Potion effects?
    // https://github.com/pmmp/PocketMine-MP/blob/5910905e954f98fd1b1d24190ca26aa727a54a1d/src/network/mcpe/handler/PreSpawnPacketHandler.php#L96-L96

    this.player.notifySelf()
    this.player.notifyInventories()
  }

  private sendAttributes(all = false): void {
    const entries = all ? this.player.attributeMap.all() : this.player.attributeMap.needSend()

    if(entries.length) {
      this.sendBatched(new UpdateAttributes({
        entityRuntimeId: this.player.id,
        entries,
      }))

      entries.forEach(e => e.markSynchronized())
    }
  }

  private initPlayerListeners() {
    this.player.on('Client:entityNotification', (entityRuntimeId, metadata) => {
      this.sendBatched(new EntityNotification({
        entityRuntimeId,
        metadata,
      }))
    })

    this.player.on('Client:inventoryNotification', inventory => {
      this.sendBatched(new InventoryNotification({
        type: inventory.type,
        items: inventory.items,
      }))
    })
  }

}
