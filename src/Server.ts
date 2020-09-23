import dgram, { Socket } from 'dgram'

import Logger from '@bwatton/logger'
import { IServer, ServerOpts } from './types/server'
import { Client } from './network/Client'
import { Player } from './Player'
import { Level } from './level/Level'
import { BedrockData } from './data/BedrockData'
import { Attribute } from './entity/Attribute'
import { FamilyStrToInt, IAddress, IPacketHandlerArgs, ISendPacketArgs } from './types/network'
import { BinaryData } from './utils/BinaryData'
import { Packets, Protocol } from './types/protocol'
import { UnconnectedPong } from './network/raknet/UnconnectedPong'
import { PlayerList, PlayerListType } from './network/bedrock/PlayerList'
import { BatchedPacket } from './network/bedrock/BatchedPacket'
import { UnconnectedPing } from './network/raknet/UnconnectedPing'
import { OpenConnectionRequestOne } from './network/raknet/OpenConnectionRequestOne'
import { OpenConnectionRequestTwo } from './network/raknet/OpenConnectionRequestTwo'
import { OpenConnectionReplyTwo } from './network/raknet/OpenConnectionReplyTwo'
import { OpenConnectionReplyOne } from './network/raknet/OpenConnectionReplyOne'
import { IncompatibleProtocol } from './network/raknet/IncompatibleProtocol'
import { Packet } from './network/Packet'
import { MovePlayer } from './network/bedrock/MovePlayer'
import { Chat } from './Chat'
import { AddPlayer } from './network/bedrock/AddPlayer'
import { CommandMap } from './command/CommandMap'
import { ICommand } from './types/commands'
import { Teleport } from './command/defaults/Teleport'
import { GlobalTick } from './tick/GlobalTick'
import { LevelEvent } from './network/bedrock/LevelEvent'
import { LevelEventType } from './types/player'
import { ItemMap } from './item/ItemMap'
import { BlockMap } from './block/BlockMap'
import { Stone } from './block/Stone'

const DEFAULT_OPTS: ServerOpts = {
  address: '0.0.0.0',
  port: 19132,
  maxPlayers: 20,
  motd: {
    line1: 'A Stardust Server',
    line2: '',
  },
}

// TODO: Merge with Stardust.ts
export class Server implements IServer {

  public static TPS = 500

  public static i: Server

  /** @deprecated use Server.i instead */
  public static current: Server

  public static logger = new Logger('Server')

  private sockets: Array<[string, Socket]> // Array<[id, Socket]>

  private startedAt: number = Date.now()

  private clients: Map<string, Client> = new Map()
  public players: Map<bigint, Player> = new Map() // Map<Player ID (Entity Runtime ID, Player)>

  public static level: Level = Level.Flat()

  private chat = new Chat(this)

  public commands = new CommandMap()

  private constructor(public opts: ServerOpts) {
    if(Server.i) {
      this.logger.error('Only one instance of Stardust can run per Node process')
      process.exit(1)
    } else {
      Server.i = Server.current = this
    }

    this.sockets = [
      ['IPv4', dgram.createSocket({ type: 'udp4', reuseAddr: true })],
      // ['IPv6', dgram.createSocket({ type: 'udp6', reuseAddr: true })],
    ]

    this.init()
  }

  public get runningTime(): bigint {
    return BigInt(Date.now() - this.startedAt)
  }

  public get level(): Level {
    return Server.level
  }

  public static async start(opts?: Partial<ServerOpts>): Promise<Server> {
    BedrockData.loadData()
    Attribute.initAttributes()
    ItemMap.registerItems()
    BlockMap.registerItems()
    GlobalTick.start(Server.TPS)

    await this.level.init()

    this.level.setBlock(0, 4, 0, 'minecraft:stone')
    this.level.setBlock(1, 5, 0, 'minecraft:dirt')
    this.level.setBlock(2, 6, 0, 'minecraft:grass')
    this.level.setBlock(3, 7, 0, 'minecraft:stone')
    this.level.setBlock(4, 8, 0, 'minecraft:dirt')
    this.level.setBlock(5, 9, 0, 'minecraft:grass')
    this.level.setBlock(6, 9, 0, 'minecraft:grass')
    this.level.setBlock(7, 9, 0, 'minecraft:grass')
    this.level.setBlock(8, 9, 0, 'minecraft:grass')
    this.level.setBlock(9, 9, 0, 'minecraft:grass')
    this.level.setBlock(10, 9, 0, 'minecraft:dirt')
    this.level.setBlock(11, 9, 0, 'minecraft:dirt')
    this.level.setBlock(12, 9, 0, 'minecraft:dirt')
    this.level.setBlock(13, 9, 0, 'minecraft:dirt')
    this.level.setBlock(14, 9, 0, 'minecraft:dirt')
    this.level.setBlock(15, 9, 0, 'minecraft:dirt')

    this.level.setBlock(16, 9, 0, 'minecraft:stone')
    this.level.setBlock(17, 9, 0, 'minecraft:stone')
    this.level.setBlock(18, 9, 0, 'minecraft:stone')
    this.level.setBlock(19, 9, 0, 'minecraft:stone')
    this.level.setBlock(20, 9, 0, 'minecraft:stone')
    this.level.setBlock(21, 9, 0, 'minecraft:stone')
    this.level.setBlock(22, 9, 0, 'minecraft:stone')
    this.level.setBlock(23, 9, 0, 'minecraft:stone')
    this.level.setBlock(24, 9, 0, 'minecraft:stone')
    this.level.setBlock(25, 9, 0, 'minecraft:stone')
    this.level.setBlock(26, 9, 0, 'minecraft:stone')
    this.level.setBlock(27, 9, 0, 'minecraft:stone')
    this.level.setBlock(28, 9, 0, 'minecraft:stone')
    this.level.setBlock(29, 9, 0, 'minecraft:stone')
    this.level.setBlock(30, 9, 0, 'minecraft:stone')
    this.level.setBlock(31, 9, 0, 'minecraft:stone')

    this.level.setBlock(32, 9, 0, 'minecraft:dirt')
    this.level.setBlock(32, 9, -1, 'minecraft:dirt')
    this.level.setBlock(32, 9, -2, 'minecraft:dirt')
    this.level.setBlock(32, 9, -3, 'minecraft:dirt')
    this.level.setBlock(32, 9, -4, 'minecraft:dirt')
    this.level.setBlock(32, 9, -5, 'minecraft:dirt')
    this.level.setBlock(32, 9, -6, 'minecraft:dirt')
    this.level.setBlock(32, 9, 1, 'minecraft:grass')
    this.level.setBlock(32, 9, 2, 'minecraft:dirt')

    return new Server(Object.assign({}, DEFAULT_OPTS, opts))
  }

  private get logger() {
    return Server.logger
  }

  private init() {
    const {
      address,
      port,
    } = this.opts

    this.initCommands()

    this.sockets.forEach(async([, socket]) => {
      socket.bind(port, address)
      // const logger = new Logger(`${this.logger.moduleName}(${id})`)
      const logger = this.logger

      socket.on('error', err => {
        logger.error(err)
        socket.close()
      })

      socket.on('listening', () => {
        const address = socket.address()
        logger.info(`Listening on ${address.address}:${address.port}`)
      })

      socket.on('message', (message, addr) => {
        const address: IAddress = {
          ip: addr.address,
          port: addr.port,
          family: FamilyStrToInt[addr.family],
        }

        const data = new BinaryData(message)
        const packetId = data.readByte(false)

        const client = this.getClient(address)
        if(client) {
          // Connected
          client.handlePacket(data)
        } else {
          // Unconnected
          switch(packetId) {
            case Packets.UNCONNECTED_PING:
              this.handleUnconnectedPing({ data, socket, address })
              break
            case Packets.OPEN_CONNECTION_REQUEST_ONE:
              this.handleConnectionRequest1({ data, socket, address })
              break
            case Packets.OPEN_CONNECTION_REQUEST_TWO:
              this.handleConnectionRequest2({ data, socket, address })
              break
            default:
              logger.debug(`unknown packet: ${packetId}`)
          }
        }
      })
    })
  }

  public addCommand(command: ICommand): void {
    for(const trigger of command.triggers) {
      if(!this.commands.has(trigger)) {
        this.commands.set(trigger, command)
      }
    }
  }

  private initCommands() {
    this.addCommand(new Teleport())
  }

  private get motd() {
    const {
      motd: {
        line1,
        line2,
      },
      maxPlayers,
    } = this.opts

    return UnconnectedPong.getMOTD({
      line1, line2, maxPlayers,
      numPlayers: this.players.size,
    })
  }

  public static getAddrId(obj: IAddress | Client): string {
    const addr = obj instanceof Client ? obj.address : obj

    return `${addr.ip}:${addr.port}`
  }

  private addClient(client: Client): void {
    this.clients.set(Server.getAddrId(client), client)
  }

  public getClient(address: IAddress): Client | null {
    return this.clients.get(Server.getAddrId(address)) || null
  }

  public removeClient(address: IAddress): void {
    this.clients.delete(Server.getAddrId(address))
  }

  public addPlayer(player: Player): void {
    this.players.set(player.id, player)

    this.updatePlayerList()
  }

  public getPlayer(id: bigint): Player | null {
    return this.players.get(id) || null
  }

  public removePlayer(id: bigint): void {
    this.players.delete(id)

    this.updatePlayerList()
  }

  public updatePlayerLocation(player: Player, includeSelf = false): void {
    const pos = player.position

    if(includeSelf) {
      console.log('SENDING MOVE TO SELF')
    }

    this.broadcast(new MovePlayer({
      runtimeEntityId: player.id,
      positionX: pos.x,
      positionY: pos.y,
      positionZ: pos.z,
      pitch: pos.pitch,
      yaw: pos.yaw,
      headYaw: pos.headYaw,
      onGround: false,
      ridingEntityRuntimeId: 0n,
    }), includeSelf ? null : player.clientId)
  }

  public broadcastLevelEvent(event: LevelEventType, x: number, y: number, z: number, data: number): void {
    this.broadcast(new LevelEvent({
      eventId: event,
      x,
      y,
      z,
      data,
    }))
  }

  private updatePlayerList() {
    this.broadcast(new PlayerList({
      type: PlayerListType.ADD,
      players: Array.from(this.players.values()),
    }))
  }

  public spawnToAll(player: Player): void {
    this.broadcast(new AddPlayer({
      uuid: player.UUID,
      username: player.username,
      entityUniqueId: player.id,
      entityRuntimeId: player.id,
      position: player.position,
      metadata: player.metadata,
    }), player.clientId)
  }

  public send({ packet, socket, address }: ISendPacketArgs): void {
    socket.send(packet.encode().toBuffer(), address.port, address.ip)
  }

  private broadcast(packet: BatchedPacket<any>, excludeClientId: bigint | null = null) {
    this.clients.forEach(async client => {
      if(typeof excludeClientId !== 'undefined' && excludeClientId === client.id) return

      client.sendBatched(packet)
    })
  }

  private handleUnconnectedPing({ data, socket, address }: IPacketHandlerArgs) {
    const ping = new UnconnectedPing().parse(data)
    const { pingId } = ping.props

    this.send({
      packet: new UnconnectedPong({
        pingId,
        motd: this.motd,
      }),
      socket,
      address,
    })
  }

  private handleConnectionRequest1({ data, socket, address }: IPacketHandlerArgs) {
    const request = new OpenConnectionRequestOne().parse(data)
    const { protocol, mtuSize } = request.props

    if(this.getClient(address)) {
      // TODO: Tell client?
      return
    }

    let packet: Packet<any>

    if(protocol !== Protocol.PROTOCOL_VERSION) {
      packet = new IncompatibleProtocol()
    } else {
      packet = new OpenConnectionReplyOne({ mtuSize })
    }

    this.send({ packet, socket, address })
  }

  private handleConnectionRequest2({ data, socket, address }: IPacketHandlerArgs) {
    const request = new OpenConnectionRequestTwo().parse(data)
    const { mtuSize, clientId } = request.props

    const client = new Client({
      id: clientId,
      address,
      mtuSize,
      socket,
    })

    this.addClient(client)

    const packet = new OpenConnectionReplyTwo({
      address,
      mtuSize,
    })

    this.send({ packet, socket, address })
  }

}
