import { Human } from './entity/Human'
import { Container } from './containers/Container'
import { UUID } from './utils/UUID'
import { getSkinData } from './utils/skins'
import { Login } from './network/bedrock/Login'
import { TextType } from './network/bedrock/Text'
import { ContainerId } from './types/containers'
import { EntityAnimationType, MetadataFlag, MetadataType, SkinData } from './types/player'
import { Item } from './item/Item'
import { Server } from './Server'
import { Chat } from './Chat'
import { PosUpdateType } from './entity/EntityPosition'
import { Metadata } from './entity/Metadata'
import { Vector3 } from 'math3d'

interface IPlayerEvents {
  'Client:entityNotification': (id: bigint, meta: Metadata) => void,
  'Client:containerNotification': (container: Container) => void,
  'Client:heldItemNotification': (id: bigint, item: Item, inventoySlot: number, hotbarSlot: number, containerId: number) => void,
  'Client:sendMessage': (message: string, xboxUserId: string, type: TextType, parameters: string[]) => void,
  'Client:updateHealth': (health: number) => void,
}

interface IPlayerCreate {
  username: string,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
  skinData: SkinData,
}

export class Player extends Human<IPlayerEvents> {

  public autoJump = true
  public allowFlight = false
  public flying = false

  public username!: string
  public UUID: UUID
  public clientUUID!: string
  public XUID!: string
  public identityPublicKey!: string
  public clientId!: bigint
  public skinData!: SkinData

  constructor(player: IPlayerCreate) {
    super(player.username, 'minecraft:player')

    Object.assign(this, player)
    this.UUID = UUID.fromString(player.clientUUID)
  }

  public static createFrom(login: Login, clientId: bigint): Player {
    const { props } = login

    return new Player({
      username: props.username,
      clientUUID: props.clientUUID,
      XUID: props.XUID,
      identityPublicKey: props.identityPublicKey,
      clientId,
      skinData: getSkinData(props),
    })
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

  public sendMessage(message: string, xboxUserId?: string, type = TextType.RAW, parameters: string[] = []): void {
    this.emit('Client:sendMessage', message, xboxUserId || '', type, parameters)
  }

  public teleport(x: number, y: number, z: number): void {
    this.position.update(x, y, z)
  }

  public updateLocation(): void {
    Server.i.updatePlayerLocation(this, this.position.updateType !== PosUpdateType.PLAYER_MOVEMENT)
  }

  public notifySelf(): void {
    this.notifyPlayers([this], this.metadata)
  }

  public notifyContainers(players: Player[] = [this]): void {
    for(const container of this.containers) {
      // console.log(container)
      for(const player of players) {
        player.emit('Client:containerNotification', container)
      }
    }
  }

  public notifyHeldItem(players: Player[] = [this]): void {
    const item = this.inventory.itemHolding

    for(const player of players) {
      const slot = this.inventory.itemInHand
      player.emit('Client:heldItemNotification', this.id, item, slot, slot, ContainerId.INVENTORY)
    }
  }

  public updateHealth(): void {
    this.emit('Client:updateHealth', this.health)

    if(this.health <= 0) {
      Server.i.despawn(this)
      Server.i.broadcastEntityAnimation(this, EntityAnimationType.DEATH, 0)
    }
  }

  public respawn(): void {
    this.notifySelf()
    this.notifyContainers()
    this.notifyHeldItem()

    Server.i.broadcastMetadata(this, this.metadata, true)
    Server.i.spawnToAll(this)
  }

  // temporary
  public makeBig(scale = 5): void {
    const difY = this.height * scale

    const human = new Human(this.name, 'minecraft:npc')
    human.scale = scale
    human.mime(this, new Vector3(0, -difY, 0))

    setTimeout(() => {
      Server.i.addEntity(human)
    }, 8000)

    this.affectedByGravity = false
    this.position.y = this.position.y + difY
  }

}