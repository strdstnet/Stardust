import Logger from '@bwatton/logger'
import { Socket } from 'dgram'
import { Server } from '../Server'
import { Player } from '../Player'
import { Vector3 } from 'math3d'
import { Disconnect } from './bedrock/Disconnect'
import { BinaryData, BitFlag } from '../utils/BinaryData'
import { PacketBatch } from './bedrock/PacketBatch'
import { bundlePackets } from '../utils/parseBundledPackets'
import { BatchedPacket } from './bedrock/BatchedPacket'
import { Reliability } from '../utils/Reliability'
import { PartialPacket } from './custom/PartialPacket'
import { PacketViolationWarning } from './bedrock/PacketViolationWarning'
import { Login } from './bedrock/Login'
import { PlayStatus } from './bedrock/PlayStatus'
import { ResourcePacksInfo } from './bedrock/ResourcePacksInfo'
import { ResourcePacksResponse } from './bedrock/ResourcePacksResponse'
import { ResourcePacksStack } from './bedrock/ResourcePacksStack'
import { RequestChunkRadius } from './bedrock/RequestChunkRadius'
import { ChunkRadiusUpdated } from './bedrock/ChunkRadiusUpdated'
import { Text, TextType } from './bedrock/Text'
import { StartGame } from './bedrock/StartGame'
import { EntityDefinitionList } from './bedrock/EntityDefinitionList'
import { BiomeDefinitionList } from './bedrock/BiomeDefinitionList'
import { Chunk } from '../level/Chunk'
import { LevelChunk } from './bedrock/LevelChunk'
import { UpdateAttributes } from './bedrock/UpdateAttributes'
import { AvailableCommands } from './bedrock/AvailableCommands'
import { AdventureSettings } from './bedrock/AdventureSettings'
import { EntityNotification } from './bedrock/EntityNotification'
import { ContainerNotification } from './bedrock/ContainerNotification'
import { EntityEquipment } from './bedrock/EntityEquipment'
import { BundledPacket } from './raknet/BundledPacket'
import { DummyAddress, IAddress, IBundledPacket, IClientArgs } from '../types/network'
import { PacketBundle } from './raknet/PacketBundle'
import { NAK } from './raknet/NAK'
import { Packets, Protocol } from '../types/protocol'
import { ConnectionRequest } from './raknet/ConnectionRequest'
import { NewIncomingConnection } from './raknet/NewIncomingConnection'
import { ConnectedPing } from './raknet/ConnectedPing'
import { ACK } from './raknet/ACK'
import { ConnectedPong } from './raknet/ConnectedPong'
import { ConnectionRequestAccepted } from './raknet/ConnectionRequestAccepted'
import { AdventureSettingsFlag, CommandPermissions, PlayerPermissions, PlayStatusType, ResourcePackResponseStatus, WorldSound } from '../types/world'
import { NetworkChunkPublisher } from './bedrock/NetworkChunkPublisher'
import { MovePlayer } from './bedrock/MovePlayer'
import { SetLocalPlayerInitialized } from './bedrock/SetLocalPlayerInitialized'
import { Chat } from '../Chat'
import { AddPlayer } from './bedrock/AddPlayer'
import { EntityMetadata } from './bedrock/EntityMetadata'
import { InteractAction, LevelEventType, MetadataGeneric, PlayerEventAction } from '../types/player'
import { Interact } from './bedrock/Interact'
import { ContainerOpen } from './bedrock/ContainerOpen'
import { PlayerAction } from './bedrock/PlayerAction'
import { CommandRequest } from './bedrock/CommandRequest'
import { ICommand } from '../types/commands'
import { EntityPosition, PosUpdateType } from '../entity/EntityPosition'
import { Animate } from './bedrock/Animate'
import { EntityFall } from './bedrock/EntityFall'
import { LevelSound } from './bedrock/LevelSound'
import { Emote } from './bedrock/Emote'
import { ContainerId, ContainerType, TransactionType } from '../types/containers'
import { ContainerClose } from './bedrock/ContainerClose'
import { Container } from '../containers/Container'
import { ContainerUpdate } from './bedrock/ContainerUpdate'
import { ContainerTransaction } from './bedrock/ContainerTransaction'
import { GlobalTick } from '../tick/GlobalTick'
import { BlockMap } from '../block/BlockMap'

interface SplitQueue {
  [splitId: number]: BundledPacket<any>,
}

export class Client {

  public static MAX_CHUNKS_PER_TICK = 5

  private logger: Logger = new Logger('Client')

  public id: bigint
  public mtuSize: number

  public address: IAddress
  public socket: Socket

  // private splitQueue: Map<number, BundledPacket<any>> = new Map()
  private splitQueue: SplitQueue = {}

  private sendQueue: BundledPacket<any>[] = []
  private sentPackets: Map<number, PacketBundle> = new Map()

  public sequenceNumber = -1

  private lastSplitId = -1

  private player!: Player

  private viewDistance = 4

  private lastPlayerChunk: string | null = null // 'x:z' last chunk we generated nearby chunks from
  private recentlySentChunks: string[] = [] // ['x:z']

  constructor({ id, address, socket, mtuSize }: IClientArgs) {
    this.id = id
    this.address = address
    this.socket = socket
    this.mtuSize = mtuSize

    this.logger.info('Created for', `${address.ip}:${address.port}`)

    // setInterval(() => {
    //   this.processSendQueue()
    // }, 50)
    GlobalTick.attach(this)
  }

  private get level() {
    return Server.i.level
  }

  public disconnect(message: string, hideScreen = false): void {
    this.send(new Disconnect({
      hideScreen,
      message,
    }))

    this.destroy()
  }

  private destroy() {
    Server.i.removeClient(this.address)
    Server.i.removePlayer(this.player.id)

    this.player.destroy()
  }

  public handlePacket(data: BinaryData): void {
    const flags = data.readByte(false)

    if(flags & BitFlag.ACK) {
      // const { props: { sequences } } = new ACK().parse(data)

      // console.log('GOT ACK:', sequences)
    } else if(flags & BitFlag.NAK) {
      const { props: { sequences } } = new NAK().parse(data)
      console.log('GOT NAK, resending:', sequences)

      for(const sequence of sequences) {
        const bundle = this.sentPackets.get(sequence)

        if(!bundle) console.log(`SEQUENCE ${sequence} NOT FOUND`)
        else this.resend(bundle)
      }
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
        // this.logger.debug(`Initial split packet for ${packet.data.buf[0]}`, packet)
        packet.data.pos = packet.data.length
        this.splitQueue[props.splitId] = packet
        // this.splitQueue.set(props.splitId, packet)
      } else {
        const queue = this.splitQueue[props.splitId]
        // this.logger.debug(`Split packet ${props.splitIndex + 1}/${props.splitCount}`)
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
    Server.i.send({
      packet: new ACK([sequenceNumber]),
      socket: this.socket,
      address: this.address,
    })
  }

  // private send(packet: BundledPacket<any>, sequenceNumber = ++this.sequenceNumber) {
  private send(packet: BundledPacket<any>) {
    // Server.current.send({
    //   packet: new PacketBundle({
    //     sequenceNumber,
    //     packets: [packet],
    //   }),
    //   socket: this.socket,
    //   address: this.address,
    // })

    this.sendQueue.push(packet)
  }

  private resend(packet: PacketBundle) {
    Server.i.send({
      packet,
      socket: this.socket,
      address: this.address,
    })
  }

  public onTick(): void {
    this.processSendQueue()
  }

  private processSendQueue() {
    if(!this.sendQueue.length) return

    const count = this.sendQueue.length > Client.MAX_CHUNKS_PER_TICK ? Client.MAX_CHUNKS_PER_TICK : this.sendQueue.length
    const packets: BundledPacket<any>[] = this.sendQueue.splice(0, count)

    const [bundles, sequenceNumber, lastSplitId] = bundlePackets(packets, this.sequenceNumber, this.lastSplitId, this.mtuSize)

    for(const packet of bundles) {
      this.sentPackets.set(packet.props.sequenceNumber, packet)

      Server.i.send({
        packet,
        socket: this.socket,
        address: this.address,
      })
    }

    // this.sendQueue = []
    this.sequenceNumber = sequenceNumber
    this.lastSplitId = lastSplitId
  }

  public sendBatched(packet: BatchedPacket<any>, reliability = Reliability.Unreliable): void {
    this.send(new PacketBatch({
      packets: [packet],
      reliability,
    }))
  }

  private sendBatchedMulti(packets: BatchedPacket<any>[], reliability = Reliability.ReliableOrdered) {
    this.send(new PacketBatch({ packets, reliability }))
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
      time: Server.i.runningTime,
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
          case Packets.REQUEST_CHUNK_RADIUS:
            this.handleChunkRadiusRequest(pk)
            break
          case Packets.TEXT:
            this.handleText(pk)
            break
          case Packets.MOVE_PLAYER:
            this.handleMove(pk)
            break
          case Packets.SET_LOCAL_PLAYER_INITIALIZED:
            this.handlePlayerSpawned(pk)
            break
          case Packets.COMMAND_REQUEST:
            this.handleCommandRequest(pk)
            break
          case Packets.PACKET_VIOLATION_WARNING:
            const { type, severity, packetId, message } = (pk as PacketViolationWarning).props

            this.logger.error('Packet Violation:', { type, severity, packetId, message })
            break
          case Packets.INTERACT:
            this.handleInteract(pk)
            break
          case Packets.PLAYER_ACTION:
            this.handlePlayerAction(pk)
            break
          case Packets.ANIMATE:
            this.handleAnimate(pk)
            break
          case Packets.ENTITY_FALL:
            this.handleEntityFall(pk)
            break
          case Packets.LEVEL_SOUND:
            this.handleLevelSound(pk)
            break
          case Packets.EMOTE:
            this.handleEmote(pk)
            break
          case Packets.CONTAINER_CLOSE:
            this.handleCloseContainer(pk)
            break
          case Packets.CONTAINER_TRANSACTION:
            this.handleContainerTransaction(pk)
            break
          case Packets.ENTITY_EQUIPMENT:
            this.handleEntityEquipment(pk)
            break
          default:
            this.logger.debug(`UNKNOWN BATCHED PACKET ${pk.id}`)
        }
      }
    }
  }

  private handleNewIncomingConnection(packet: NewIncomingConnection) {
    // console.log('nic', packet.props)
  }

  private handleLogin(packet: Login) {
    // TODO: Login verification, already logged in?, ...

    this.player = Player.createFrom(packet, this.id)
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
    ], Reliability.Unreliable)
    // this.sendBatched()
    // this.sendBatched()
  }

  private async handleResourcePacksResponse(packet: ResourcePacksResponse) {
    const { status } = packet.props

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

  private handleChunkRadiusRequest(packet: RequestChunkRadius) {
    const { radius } = packet.props

    this.sendBatched(new ChunkRadiusUpdated({
      radius,
    }))

    // this.sendBatched(new NetworkChunkPublisher({
    //   x: this.player.position.x,
    //   y: this.player.position.y,
    //   z: this.player.position.z,
    //   radius: this.viewDistance * 16,
    // }))
  }

  private handleText(packet: Text) {
    const {
      type,
      message,
    } = packet.props

    if(type === TextType.CHAT) {
      this.player.chat(message)
    }
  }

  private handleMove(packet: MovePlayer) {
    const {
      positionX: x,
      positionY: y,
      positionZ: z,
      pitch,
      yaw,
      headYaw,
    } = packet.props

    // console.log({
    //   positionX,
    //   positionY,
    //   positionZ,
    //   pitch,
    //   yaw,
    //   headYaw,
    // })
    this.player.position.update(new EntityPosition(x, y, z, pitch, yaw, headYaw), PosUpdateType.PLAYER_MOVEMENT)

    this.sendNearbyChunks()
  }

  private handlePlayerSpawned(packet: SetLocalPlayerInitialized) {
    this.sendBatched(new NetworkChunkPublisher({
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z,
      radius: this.viewDistance * 16,
    }))

    Server.i.spawnToAll(this.player)

    Server.i.players.forEach(async player => {
      if(this.id === player.clientId) return

      this.sendBatched(new AddPlayer({
        uuid: player.UUID,
        username: player.username,
        entityUniqueId: player.id,
        entityRuntimeId: player.id,
        position: player.position,
        metadata: player.metadata,
      }))
    })
    Chat.i.broadcastPlayerJoined(this.player)
  }

  private handleInteract(packet: Interact) {
    const { action } = packet.props

    switch(action) {
      case InteractAction.OPEN_INVENTORY:
        this.sendBatched(new ContainerOpen({
          windowId: ContainerId.INVENTORY,
          containerType: ContainerType.INVENTORY,
          containerX: 0,
          containerY: 0,
          containerZ: 0,
          containerEntityId: this.player.id,
        }))
        break
      default:
        this.logger.error(`Unknown interact ID: ${action}`)
    }
  }

  private handleCloseContainer(packet: ContainerClose) {
    const { windowId } = packet.props

    this.sendBatched(new ContainerClose({
      windowId,
    }))
  }

  private async handleContainerTransaction(packet: ContainerTransaction) {
    const { type, position: pos, itemHolding, face } = packet.props.transaction

    const block = this.level.getBlockAt(pos.x, pos.y, pos.z)

    // Server.i.broadcastTransaction(packet.props)

    // console.log(packet.props)

    switch(type) {
      case TransactionType.BREAK_BLOCK:
        Server.i.broadcastLevelEvent(LevelEventType.PARTICLE_DESTROY, pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, block.runtimeId)
        this.sendContainerUpdate(this.player.inventory, this.player.inventory.add(block.item))
        Server.i.level.setBlock(pos.x, pos.y, pos.z, BlockMap.AIR)
        break
      case TransactionType.CLICK_BLOCK:
        if(itemHolding.name === 'minecraft:air') return
        Server.i.broadcastLevelSound(WorldSound.PLACE, new Vector3(pos.x, pos.y, pos.z), itemHolding.runtimeId, ':', false, false)
        const blockPos = Server.i.level.getRelativeBlockPosition(pos.x, pos.y, pos.z, face)
        Server.i.level.setBlock(blockPos.x, blockPos.y, blockPos.z, itemHolding.name)
        break
    }
  }

  private async handlePlayerAction(packet: PlayerAction) {
    const { action, actionX, actionY, actionZ, face } = packet.props

    const block = this.level.getBlockAt(actionX, actionY, actionZ)

    switch(action) {
      case PlayerEventAction.START_BREAK:
        Server.i.broadcastLevelEvent(LevelEventType.BLOCK_START_BREAK, actionX, actionY, actionZ, 65536 / (block.breakTime / 50))
        break
      case PlayerEventAction.CONTINUE_BREAK:
        Server.i.broadcastLevelEvent(LevelEventType.PARTICLE_PUNCH_BLOCK, actionX, actionY, actionZ, block.runtimeId | (face << 24))
        break
      case PlayerEventAction.ABORT_BREAK:
      case PlayerEventAction.STOP_BREAK:
        Server.i.broadcastLevelEvent(LevelEventType.BLOCK_STOP_BREAK, actionX, actionY, actionZ, 0)
        break
      case PlayerEventAction.START_SNEAK:
        this.player.metadata.setGeneric(MetadataGeneric.SNEAKING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.STOP_SNEAK:
        this.player.metadata.setGeneric(MetadataGeneric.SNEAKING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.START_SPRINT:
        this.player.metadata.setGeneric(MetadataGeneric.SPRINTING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.STOP_SPRINT:
        this.player.metadata.setGeneric(MetadataGeneric.SPRINTING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.START_SWIMMING:
        this.player.metadata.setGeneric(MetadataGeneric.SWIMMING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.STOP_SWIMMING:
        this.player.metadata.setGeneric(MetadataGeneric.SWIMMING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      default:
        this.logger.error(`Unhandled PlayerAction ID: ${action}`)
    }
  }

  private handleAnimate(packet: Animate) {
    const { action } = packet.props

    Server.i.broadcastAnimate(this.player, action)
  }

  private handleCommandRequest(packet: CommandRequest) {
    const { command } = packet.props

    const [ trigger, ...args ] = command.substr(1, command.length - 1).split(' ')

    if(Server.i.commands.has(trigger)) {
      (Server.i.commands.get(trigger) as ICommand).execute({
        trigger,
        args,
        sender: this.player,
      })
    }
  }

  private handleEntityFall(packet: EntityFall) {
    const { runtimeEntityId, fallDistance, isInVoid } = packet.props

    console.log('ENTITY FELL', { runtimeEntityId, fallDistance, isInVoid })
  }

  private handleLevelSound(packet: LevelSound) {
    const { sound, position, extraData, entityType, isBabyMob, disableRelativeVolume } = packet.props

    Server.i.broadcastLevelSound(
      sound,
      position,
      extraData,
      entityType,
      isBabyMob,
      disableRelativeVolume,
    )
  }

  private handleEmote(packet: Emote) {
    const { runtimeEntityId, emoteId, flags } = packet.props

    console.log('EMOTE', { runtimeEntityId, emoteId, flags })

    this.player.sendMessage('Emotes are currently disabled on this server.')

    // Server.i.broadcastEmote(this.player, emoteId, flags)
  }

  private handleEntityEquipment(packet: EntityEquipment) {
    const { item, inventorySlot, hotbarSlot, containerId } = packet.props

    Server.i.broadcastEntityEquipment(this.player, item, inventorySlot, hotbarSlot, containerId)

    // console.log('ENTITY SWITCHED SLOTS', packet.props)
  }

  private async completeLogin() {
    this.sendBatched(new StartGame({
      entityUniqueId: this.player.id,
      entityRuntimeId: this.player.id,
      playerPosition: this.player.position,
      spawnLocation: new Vector3(0, 20, 0),
    }), Reliability.Unreliable)

    // // TODO: Name tag visible, can climb, immobile
    // // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/Player.php#L2255

    Server.logger.info(`${this.player.name} logged in from ${this.address.ip}:${this.address.port} with MTU ${this.mtuSize}`)

    this.sendBatched(new EntityDefinitionList(), Reliability.Unreliable)
    this.sendBatched(new BiomeDefinitionList(), Reliability.Unreliable)

    this.sendAttributes(true)
    this.sendMetadata()

    this.sendAvailableCommands()
    // this.sendAdventureSettings()

    // // TODO: Potion effects?
    // // https://github.com/pmmp/PocketMine-MP/blob/5910905e954f98fd1b1d24190ca26aa727a54a1d/src/network/mcpe/handler/PreSpawnPacketHandler.php#L96-L96

    Server.i.addPlayer(this.player)

    this.player.notifySelf()
    this.player.notifyContainers()
    this.player.notifyHeldItem()

    await this.sendNearbyChunks()

    this.sendBatched(new PlayStatus({
      status: PlayStatusType.PLAYER_SPAWN,
    }))
  }

  private async sendNearbyChunks(): Promise<void> {
    const [ chunkX, chunkZ ] = Chunk.getChunkCoords(this.player.position)

    const chunkXZ = `${chunkX}:${chunkZ}`
    if(chunkXZ === this.lastPlayerChunk) return
    this.lastPlayerChunk = chunkXZ

    const neededChunks: [number, number][] = []
    const chunkCoords: string[] = []

    const maybePush = (x: number, z: number) => {
      const coords = `${x}:${z}`
      if(!this.recentlySentChunks.includes(coords)) {
        neededChunks.push([x, z])
        chunkCoords.push(coords)
        this.recentlySentChunks.push(coords)
      }
    }
    maybePush(chunkX, chunkZ)

    for(let d = 1; d <= this.viewDistance; d++) { // x+
      maybePush(chunkX + d, chunkZ)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX + d, chunkZ - d2)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // x-
      maybePush(chunkX - d, chunkZ)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX - d, chunkZ + d2)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // z+
      maybePush(chunkX, chunkZ + d)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX + d2, chunkZ + d)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // z-
      maybePush(chunkX, chunkZ - d)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX - d2, chunkZ - d)
      }
    }

    // console.log(neededChunks)

    for(const [x, z] of neededChunks) {
      const chunk = await Server.i.level.getChunkAt(x, z)
      // const chunk = new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])

      this.sendBatched(new LevelChunk({
        chunk,
        cache: false,
        usedHashes: [],
      }), Reliability.Unreliable)
    }

    if(neededChunks.length > 1) {
      this.sendBatched(new NetworkChunkPublisher({
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        radius: this.viewDistance * 16,
      }))
    }

    if(this.recentlySentChunks.length > (this.nearbyChunkCount * 2)) {
      // console.log(this.recentlySentChunks)
      this.recentlySentChunks.splice(0, this.nearbyChunkCount)
    }
  }

  private get nearbyChunkCount() {
    return ((this.viewDistance * this.viewDistance) + this.viewDistance) * 4
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

  private sendMetadata(metadata = this.player.metadata) {
    this.sendBatched(new EntityMetadata({
      entityRuntimeId: this.player.id,
      metadata,
    }))
  }

  private sendAvailableCommands() {
    this.sendBatched(new AvailableCommands(), Reliability.Unreliable)
  }

  private sendAdventureSettings() {
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
  }

  private initPlayerListeners() {
    this.player.on('Client:entityNotification', (entityRuntimeId, metadata) => {
      this.sendBatched(new EntityNotification({
        entityRuntimeId,
        metadata,
      }))
    })

    this.player.on('Client:containerNotification', container => {
      this.sendContainer(container)
    })

    this.player.on('Client:heldItemNotification', (entityRuntimeId, item, inventorySlot, hotbarSlot, containerId) => {
      this.sendBatched(new EntityEquipment({
        entityRuntimeId,
        item,
        inventorySlot,
        hotbarSlot,
        containerId,
      }))
    })

    this.player.on('Client:sendMessage', (message, type, parameters) => {
      this.sendBatched(new Text({
        type,
        message,
        parameters,
      }))
    })
  }

  private sendContainer(container: Container) {
    this.sendBatched(new ContainerNotification({
      containerId: container.id,
      items: container.items,
    }), Reliability.Unreliable)
  }

  private sendContainerUpdate(container: Container, slot: number) {
    this.sendBatched(new ContainerUpdate({
      containerId: container.id,
      slot,
      item: container.items[slot],
    }), Reliability.Unreliable)
  }

}
