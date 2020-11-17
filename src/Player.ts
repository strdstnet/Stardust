import { Human } from './entity/Human'
import { UUID } from './utils/UUID'
import { getSkinData } from './utils/skins'
import { Login } from './network/bedrock/Login'
import { TextType } from './network/bedrock/Text'
import { ContainerId } from './types/containers'
import { EntityAnimationType, MetadataFlag, MetadataType, DamageCause, SkinData } from './types/player'
import { Server } from './Server'
import { Chat } from './Chat'
import { PosUpdateType } from './entity/EntityPosition'
import { Metadata } from './entity/Metadata'
import { Event } from '@hyperstonenet/utils.events'

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

  constructor(player: IPlayerCreate, protected client: Client) {
    super(player.username, 'minecraft:player')

    Object.assign(this, player)
    this.UUID = UUID.fromString(player.clientUUID)

    this.inventory.on('slotChanged', (ev) => {
      this.client.sendContainerUpdate(this.inventory, ev.data.slot)
    })
  }

  public get clientId(): bigint {
    return this.client.id
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

  protected doFallTick(): void {
    return // This is done client side, for now
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
    return true
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
      Server.i.broadcastEntityAnimation(this, EntityAnimationType.DEATH, 0)
      Server.i.despawn(this)
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
  }

}

import { Client } from './network/Client'
import { TitleType } from './types/interface'

