import { Human } from './entity/Human'
import { getSkinData } from './utils/skins'
import { ContainerId } from './types/containers'
import { EntityAnimationType, DamageCause, SkinData, Direction } from './types/player'
import { Server } from './Server'
import { Chat } from './Chat'
import { PosUpdateType } from './entity/EntityPosition'
import { MetadataFlag, MetadataType, UUID, Vector3 } from '@strdstnet/utils.binary'

interface IPlayerCreate {
  username: string,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  skinData: SkinData,
}

type PlayerEvents = {

}

export class Player extends Human<PlayerEvents> {

  public autoJump = true
  public allowFlight = false
  public flying = false

  public username!: string
  public UUID: UUID
  public clientUUID!: string
  public XUID!: string
  public identityPublicKey!: string
  public skinData!: SkinData

  public permissionLevel = PlayerPermissions.MEMBER

  public gamemode: Gamemode = Gamemode.SURVIVAL

  constructor(player: IPlayerCreate, public client: Client) {
    super(player.username, 'minecraft:player')

    Object.assign(this, player)
    this.UUID = UUID.fromString(player.clientUUID)

    this.inventory.on('slotChanged', (ev) => {
      this.client.sendContainerUpdate(this.inventory, ev.data.slot)
    })
  }

  public get displayName(): string {
    return this.username
  }

  public get clientId(): bigint {
    return this.client.id
  }

  public get facing(): Direction {
    const hy = this.position.headYaw

    if(hy > 315 || hy <= 45) return Direction.NORTH

    if(hy > 45 && hy <= 135) return Direction.EAST

    if(hy > 135 && hy <= 225) return Direction.SOUTH

    return Direction.WEST
  }

  public get facingAwayFrom(): Direction {
    switch(this.facing) {
      case Direction.NORTH:
        return Direction.SOUTH
      case Direction.EAST:
        return Direction.WEST
      case Direction.SOUTH:
        return Direction.NORTH
      case Direction.WEST:
        return Direction.EAST
    }
  }

  get chunkX() {
    return this.position.x & 0x0f
  }
  get chunkZ() {
    return this.position.z & 0x0f
  }

  public static createFrom(login: Login, client: Client): Player {
    const { props } = login

    return new Player({
      username: props.username,
      clientUUID: props.clientUUID,
      XUID: props.XUID,
      identityPublicKey: props.identityPublicKey,
      skinData: getSkinData(props),
    }, client)
  }

  public async onTick(): Promise<void> {
    await super.onTick()

    if(this.attributeMap.dirty) {
      this.attributeMap.dirty = false

      this.client.sendAttributes()
    }
  }

  public kill(cause?: DamageCause, args?: string[]): void {
    super.kill(cause, args)

    Chat.i.playerDied(this.lastDamageCause, this.lastDamageArgs)
  }

  protected addMetadata(): void {
    super.addMetadata()

    this.metadata.add(MetadataFlag.NAMETAG, MetadataType.STRING, this.name)
  }

  public isSpectator(): boolean {
    return false
  }

  public chat(message: string): void {
    Chat.i.playerChat(this, message)
  }

  public sendMessage(message: string, type = TextType.RAW, parameters: string[] = []): void {
    this.client.sendMessage(message, type, parameters)
  }

  public sendTitle(message: string, type = TitleType.TITLE, fadeInTime = 0, stayTime = 0, fadeOutTime = 0): void {
    this.client.sendTitle(message, type, fadeInTime, stayTime, fadeOutTime)
  }

  public teleport(x: number, y: number, z: number): void {
    this.position.update(x, y, z, PosUpdateType.OTHER)
  }

  public setGamemode(gameMode: string | Gamemode): void {
    if(typeof gameMode === 'string') {
      switch(gameMode.toLowerCase()) {
        case 's':
        case 'survival':
          this.client.updateGamemode(Gamemode.SURVIVAL)
          break
        case 'c':
        case 'creative':
          this.client.updateGamemode(Gamemode.CREATIVE)
          break
        case 'a':
        case 'adventure':
          this.client.updateGamemode(Gamemode.ADVENTURE)
          break
        case 'sp':
        case 'spectator':
          this.client.updateGamemode(Gamemode.SPECTATOR)
          break
      }
    } else {
      this.client.updateGamemode(gameMode)
    }
  }

  public updateLocation(): void {
    Server.i.updatePlayerLocation(this, this.position.updateType !== PosUpdateType.PLAYER_MOVEMENT)
  }

  public notifySelf(): void {
    this.notifyPlayers([this], this.metadata)
  }

  public notifyContainers(players: Player[] = [this]): void {
    for(const container of this.containers) {
      for(const player of players) {
        player.client.sendContainer(container)
      }
    }
  }

  public sendEntityMetadata(entityRuntimeId: bigint, metadata: Metadata): void {
    this.client.sendEntityMetadata(entityRuntimeId, metadata)
  }

  public notifyHeldItem(players: Player[] = [this]): void {
    const item = this.inventory.itemHolding

    for(const player of players) {
      const slot = this.inventory.itemInHand
      player.client.sendEntityEquipment(this.id, item, slot, slot, ContainerId.INVENTORY)
    }
  }

  public updateHealth(): void {
    this.client.setHealth(this.health)

    if(this.health <= 0) {
      setTimeout(() => {
        Server.i.broadcastEntityAnimation(this, EntityAnimationType.DEATH, 0)
      }, Server.TPS / 3)
    }
  }

  public respawn(): void {
    this.resetLastDamage()
    this.resetHealth()

    this.notifySelf()
    this.notifyContainers()
    this.notifyHeldItem()

    Server.i.broadcastMetadata(this, this.metadata, true)
    Server.i.spawnToAll(this)

    this.isAlive = true
  }

  public async getChunksAhead(viewDistance: number, withRearPadding = false): Promise<Chunk[]> {
    return this.getChunks(viewDistance, this.facing, withRearPadding)
  }

  public async getChunksBehind(viewDistance: number, withRearPadding = false): Promise<Chunk[]> {
    return this.getChunks(viewDistance, this.facingAwayFrom, withRearPadding)
  }

  private async getChunks(distance: number, direction: Direction, withRearPadding = false): Promise<Chunk[]> {
    const forwardUnit = direction === Direction.NORTH || direction === Direction.SOUTH ? 'z' : 'x'
    const sideUnit = forwardUnit === 'x' ? 'z' : 'x'
    const add = direction === Direction.NORTH || direction === Direction.WEST

    const chunks = [
      await this.level.getChunkAt(this.chunkX, this.chunkZ),
    ]

    const pos = [this.chunkX, this.chunkZ]

    const ch = (a: number, b: number) => add ? a + b : a - b

    if(withRearPadding) {
      chunks.push(await this.level.getChunkAt(
        forwardUnit === 'x' ? ch(pos[0], -1) : pos[0],
        forwardUnit === 'z' ? ch(pos[1], -1) : pos[1],
      ))
    }

    for(let i = 1; i <= distance; i++) {
      // Left
      chunks.push(await this.level.getChunkAt(
        sideUnit === 'x' ? pos[0] - i : pos[0],
        sideUnit === 'z' ? pos[1] - i : pos[1],
      ))

      // Right
      chunks.push(await this.level.getChunkAt(
        sideUnit === 'x' ? pos[0] + i : pos[0],
        sideUnit === 'z' ? pos[1] + i : pos[1],
      ))

      if(withRearPadding) {
        // Left
        chunks.push(await this.level.getChunkAt(
          sideUnit === 'x' ? pos[0] - i : ch(pos[0], -1),
          sideUnit === 'z' ? pos[1] - i : ch(pos[1], -1),
        ))

        // Right
        chunks.push(await this.level.getChunkAt(
          sideUnit === 'x' ? pos[0] + i : ch(pos[0], -1),
          sideUnit === 'z' ? pos[1] + i : ch(pos[1], -1),
        ))
      }

      // Forward
      chunks.push(await this.level.getChunkAt(
        forwardUnit === 'x' ? ch(pos[0], i) : pos[0],
        forwardUnit === 'z' ? ch(pos[1], i) : pos[1],
      ))

      // Between spokes
      for(let i2 = 1; i2 <= distance - i; i2++) {
        chunks.push(await this.level.getChunkAt(
          sideUnit === 'z' ? ch(pos[0], i) : pos[0] - i2,
          sideUnit === 'z' ? pos[1] - i2 : ch(pos[1], i),
        ))

        chunks.push(await this.level.getChunkAt(
          sideUnit === 'z' ? ch(pos[0], i) : pos[0] + i2,
          sideUnit === 'z' ? pos[1] + i2 : ch(pos[1], i),
        ))
      }
    }

    return chunks
  }

}

import { Client } from './network/Client'
import { Login, TextType, TitleType, Gamemode, PlayerPermissions } from '@strdstnet/protocol'
import { Metadata } from '@strdstnet/utils.binary/lib/Metadata'
import { Chunk } from './level'

