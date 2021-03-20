import dgram, { Socket } from 'dgram'

import Logger from '@bwatton/logger'
import { IServer, ServerOpts } from './types/server'
import { Client } from './network/Client'
import { Player } from './Player'
import { Level } from './level/Level'
import { Attribute } from './entity/Attribute'
import { FamilyStrToInt, IPacketHandlerArgs, ISendPacketArgs } from './types/network'
import { Chat } from './Chat'
import { GlobalTick } from './tick/GlobalTick'
import { LevelEventType, PlayerAnimation } from './types/player'
import { ItemMap } from './item/ItemMap'
import { BlockMap } from './block/BlockMap'
import { Entity } from './entity/Entity'
import { Block } from './block/Block'
import { EventEmitter } from '@strdstnet/utils.events'
import { PluginManager } from './PluginManager'
import { DroppedItem } from './entity/DroppedItem'
import { PlayerEvent } from './events/PlayerEvent'
import { Console } from './console/Console'
import { CommandHandler } from './command/CommandHandler'
import {
  AddDroppedItem,
  AddEntity,
  AddPlayer,
  Animate,
  BatchedPacket,
  BlockUpdate,
  Emote,
  EntityAnimation,
  EntityEquipment,
  EntityMetadata,
  EzLogin,
  IncompatibleProtocol,
  LevelEvent,
  LevelSound,
  Login,
  MoveEntity,
  MovePlayer,
  MovePlayerMode,
  OpenConnectionReplyOne,
  OpenConnectionReplyTwo,
  OpenConnectionRequestOne,
  OpenConnectionRequestTwo,
  Packet,
  Packets,
  PickupDroppedItem,
  PlayerList,
  PlayerListType,
  Protocol,
  RemoveEntity,
  SetEntityMotion,
  UnconnectedPing,
  UnconnectedPong,
  WorldSound,
} from '@strdstnet/protocol'
import { Metadata } from '@strdstnet/utils.binary/lib/Metadata'
import { BinaryData, IAddress, IItem, Vector3 } from '@strdstnet/utils.binary'

const DEFAULT_OPTS: ServerOpts = {
  address: '0.0.0.0',
  port: 19132,
  maxPlayers: 20,
  level: 'hsn',
  motd: {
    line1: 'A Stardust Server',
    line2: '',
  },
}

type ServerEvents = {
  playerJoined: PlayerEvent,
  playerSpawned: PlayerEvent,
}

// TODO: Merge with Stardust.ts
export class Server extends EventEmitter<ServerEvents> implements IServer {

  public static id = 80725802752n

  public static TPS = 20
  public static TICK_MS = 1000 / Server.TPS

  public static i: Server

  public static logger = new Logger('Server')

  private sockets: Array<[string, Socket]> // Array<[id, Socket]>

  private startedAt: number = Date.now()

  private clients: Map<string, Client> = new Map()
  public players: Map<bigint, Player> = new Map() // Map<Player ID (Entity Runtime ID, Player)>

  public static level: Level

  private chat = new Chat(this)

  private constructor(public opts: ServerOpts, public level: Level) {
    super()

    if(Server.i) {
      this.logger.error('Only one instance of Stardust can run per Node process')
      process.exit(1)
    } else {
      // eslint-disable-next-line deprecation/deprecation
      Server.i = this
    }

    this.sockets = [
      ['IPv4', dgram.createSocket({ type: 'udp4', reuseAddr: true })],
      // ['IPv6', dgram.createSocket({ type: 'udp6', reuseAddr: true })],
    ]
  }

  public get runningTime(): bigint {
    return BigInt(Date.now() - this.startedAt)
  }

  public static async start(opts?: Partial<ServerOpts>): Promise<Server> {
    await ItemMap.registerItems()
    this.logger.as('ItemMap').info(`Registered ${ItemMap.count} items`)

    await BlockMap.populate()
    this.logger.as('BlockMap').info(`Registered ${BlockMap.count} blocks`)

    Attribute.initAttributes()
    GlobalTick.start(Server.TPS)

    const allOpts = Object.assign({}, DEFAULT_OPTS, opts)
    const level = await Level.load(allOpts.level)

    const server = new Server(allOpts, level)

    await PluginManager.init()
    await CommandHandler.init()
    await Console.init()

    return server.init()
  }

  private get logger() {
    return Server.logger
  }

  private init(): Server {
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
            case Packets.EZ_LOGIN:
              this.handleEzLogin({ data, socket, address })
              break
            default:
              logger.debug(`unknown packet: ${packetId}`)
          }
        }
      })
    })

    return this
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
      serverId: Server.id,
      gamemode: 'Survival',
    })
  }

  public get numPlayers(): number {
    return this.players.size
  }

  public get maxPlayers(): number {
    return this.opts.maxPlayers
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
    this.emit('playerJoined', new PlayerEvent({
      player,
    }))

    this.players.set(player.id, player)
    this.level.addEntity(player)

    this.broadcast(new PlayerList({
      type: PlayerListType.ADD,
      players: [player],
    }))
  }

  public getPlayer(id: bigint): Player | null {
    return this.players.get(id) || null
  }

  public getPlayerByUsername(username: string): Player | null {
    for(const [, player] of this.players) {
      if(player.username.toLowerCase() === username.toLowerCase()) return player
    }

    return null
  }

  public removePlayer(id: bigint): void {
    const player = this.players.get(id)
    if(!player) return

    this.players.delete(id)

    this.removeEntity(id)

    this.broadcast(new PlayerList({
      type: PlayerListType.REMOVE,
      players: [player],
    }))
  }

  public removeEntity(id: bigint): void {
    this.level.removeEntity(id)
    this.broadcast(new RemoveEntity({
      entityRuntimeId: id,
    }))
  }

  public pickupItem(item: bigint, entity: bigint): void {
    this.broadcast(new PickupDroppedItem({
      target: item,
      runtimeEntityId: entity,
    }))
  }

  public updatePlayerLocation(player: Player, includeSelf = false, mode?: MovePlayerMode.NORMAL): void {
    const pos = player.position

    this.broadcast(new MovePlayer({
      runtimeEntityId: player.id,
      positionX: pos.x,
      positionY: pos.y,
      positionZ: pos.z,
      pitch: pos.pitch,
      yaw: pos.yaw,
      headYaw: pos.headYaw,
      mode,
      onGround: false,
      ridingEntityRuntimeId: 0n,
    }), includeSelf ? null : player.clientId)
  }

  public updateBlock(position: Vector3, block: Block): void {
    this.broadcast(new BlockUpdate({
      position,
      blockRuntimeId: block.rid,
    }))
  }

  public moveEntity(entity: Entity<any>): void {
    this.broadcast(new MoveEntity({
      runtimeEntityId: entity.id,
      position: entity.position.coords,
      mode: 2,
    }))
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

  public broadcastMetadata(player: Player, metadata: Metadata, includeSelf = false): void {
    this.broadcast(new EntityMetadata({
      entityRuntimeId: player.id,
      metadata,
      tick: 0n,
    }), includeSelf ? null : player.clientId)
  }

  public broadcastAnimate(player: Player, action: PlayerAnimation): void {
    this.broadcast(new Animate({
      action,
      entityRuntimeId: player.id,
    }), player.clientId)
  }

  public broadcastLevelSound(
    sound: number | WorldSound,
    position: Vector3,
    extraData: number,
    entityType: string,
    isBabyMob: boolean,
    disableRelativeVolume: boolean,
  ): void {
    this.broadcast(new LevelSound({
      sound,
      position,
      extraData,
      entityType,
      isBabyMob,
      disableRelativeVolume,
    }))
  }

  public broadcastEmote(player: Player, emoteId: string, flags: number): void {
    this.broadcast(new Emote({
      runtimeEntityId: player.id,
      emoteId,
      flags,
    }))
  }

  public broadcastEntityEquipment(
    player: Player,
    item: IItem,
    inventorySlot: number,
    hotbarSlot: number,
    containerId: number,
  ): void {
    this.broadcast(new EntityEquipment({
      entityRuntimeId: player.id,
      item,
      inventorySlot,
      hotbarSlot,
      containerId,
    }), player.clientId)
  }

  public broadcastEntityAnimation(target: Entity<any>, event: number, data: number): void {
    this.broadcast(new EntityAnimation({
      entityRuntimeId: target.id,
      event,
      data,
    }))
  }

  public addEntity(entity: Entity<any, any>): void {
    this.broadcast(new AddEntity({
      entityRuntimeId: entity.id,
      type: entity.gameId,
      position: entity.position.coords,
      motion: entity.position.motion,
      pitch: entity.position.pitch,
      yaw: entity.position.yaw,
      headYaw: entity.position.headYaw,
      metadata: entity.metadata,
    }))
  }

  public spawnToAll(entity: Entity): void {
    if (entity instanceof Player) {
      this.broadcast(new AddPlayer({
        uuid: entity.UUID,
        username: entity.username,
        entityUniqueId: entity.id,
        entityRuntimeId: entity.id,
        position: entity.position.coords,
        motion: entity.position.motion,
        pitch: entity.position.pitch,
        yaw: entity.position.yaw,
        headYaw: entity.position.headYaw,
        metadata: entity.metadata,
        permissions: entity.permissionLevel,
      }), entity.clientId)
    } else if (entity instanceof DroppedItem){
      this.broadcast(new AddDroppedItem({
        entityUniqueId: entity.id,
        entityRuntimeId: entity.id,
        item: entity.item,
        position: entity.position.coords,
        motion: entity.position.motion,
        metadata: entity.metadata,
        fromFishing: entity.fromFishing,
      }))
    } else {
      this.broadcast(new AddEntity({
        entityRuntimeId: entity.id,
        type: entity.gameId,
        position: entity.position.coords,
        motion: entity.position.motion,
        pitch: entity.position.pitch,
        yaw: entity.position.yaw,
        headYaw: entity.position.headYaw,
        metadata: entity.metadata,
      }))
    }
  }

  public despawn(player: Player): void {
    this.broadcast(new RemoveEntity({
      entityRuntimeId: player.id,
    }), player.clientId)
  }

  public sendMotion(entity: Entity<any>, motion: Vector3): void {
    this.broadcast(new SetEntityMotion({
      runtimeEntityId: entity.id,
      motion,
    }))
  }

  public send({ packet, socket, address }: ISendPacketArgs): void {
    const data = packet instanceof Packet ? packet.encode() : packet
    // this.logger.debug('Sending', data.buf)
    socket.send(data.toBuffer(), address.port, address.ip)
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
        serverId: Server.id,
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
      packet = new OpenConnectionReplyOne({
        mtuSize,
        serverId: Server.id,
      })
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
      serverId: Server.id,
    })

    this.send({ packet, socket, address })
  }

  private handleEzLogin({ data, socket, address }: IPacketHandlerArgs) {
    const ezLogin = new EzLogin().parse(data)
    const { mtuSize, clientId, sequenceNumber, loginData } = ezLogin.props

    const client = new Client({
      id: clientId,
      address,
      mtuSize,
      socket,
    }, sequenceNumber)

    this.addClient(client)

    client.handleLogin(new Login().parse(loginData))
    client.doSpawn()
  }

}
