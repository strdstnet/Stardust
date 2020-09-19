import dgram, { Socket } from 'dgram'

import Logger from '@bwatton/logger'
import { ServerOpts, IAddress, FamilyStrToInt, IPacketHandlerArgs, Packets, ISendPacketArgs, Protocol, PlayerPosition } from './types'
import { BinaryData, Client } from './network'
import { UnconnectedPing, UnconnectedPong, OpenConnectionRequestOne, IncompatibleProtocol, OpenConnectionReplyOne, OpenConnectionRequestTwo, OpenConnectionReplyTwo } from './network/raknet'
import { Packet } from './network/Packet'
import { BedrockData } from './data/BedrockData'
import { Attribute } from './entity/Attribute'
import { Player } from './Player'
import { BatchedPacket } from './network/bedrock/BatchedPacket'
import { PlayerList, PlayerListType } from './network/bedrock/PlayerList'
import { Item } from './item/Item'
import { Level } from './level'
import { TextType } from './network/bedrock'
import { MovePlayer } from './network/bedrock/MovePlayer'

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
export class Server {

  public static current: Server

  public static logger = new Logger('Server')

  private sockets: Array<[string, Socket]> // Array<[id, Socket]>

  private startedAt: number = Date.now()

  private clients: Map<string, Client> = new Map()
  private players: Map<bigint, Player> = new Map() // Map<Player ID (Entity Runtime ID, Player)>

  public level: Level = Level.TestWorld()

  private constructor(public opts: ServerOpts) {
    if(Server.current) {
      this.logger.error('Only one instance of Stardust can run per Node process')
      process.exit(1)
    } else {
      Server.current = this
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

  public static async start(opts?: Partial<ServerOpts>): Promise<Server> {
    BedrockData.loadData()
    Attribute.initAttributes()
    Item.registerItems()

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

  public playerChat(sender: Player, message: string): void {
    for(const [, player ] of this.players) {
      player.sendMessage(`${sender.username}: ${message}`, TextType.RAW)
    }
  }

  public playerMove(source: Player, pos: PlayerPosition): void {
    this.broadcast(new MovePlayer({
      positionX: pos.location.x,
      positionY: pos.location.y,
      positionZ: pos.location.z,
      pitch: pos.pitch,
      yaw: pos.yaw,
      headYaw: pos.headYaw,
      onGround: true,
      ridingEntityRuntimeId: 0n,
    }))
  }

  private updatePlayerList() {
    this.broadcast(new PlayerList({
      type: PlayerListType.ADD,
      players: Array.from(this.players.values()),
    }))
  }

  public send({ packet, socket, address }: ISendPacketArgs): void {
    socket.send(packet.encode().toBuffer(), address.port, address.ip)
  }

  private broadcast(packet: BatchedPacket<any>) {
    this.clients.forEach(async client => client.sendBatched(packet))
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
