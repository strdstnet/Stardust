import { Human } from './entity/Human'
import { Container } from './containers/Container'
import { UUID } from './utils/UUID'
import { getSkinData } from './utils/skins'
import { Login } from './network/bedrock/Login'
import { TextType } from './network/bedrock/Text'
import { ContainerId } from './types/containers'
import { MetadataFlag, MetadataGeneric, MetadataType, SkinData } from './types/player'
import { Item } from './item/Item'
import { Server } from './Server'
import { PlayerPosition } from './types/data'
import { Chat } from './Chat'

interface IPlayerEvents {
  'Client:entityNotification': (id: bigint, meta: any[]) => void,
  'Client:containerNotification': (container: Container) => void,
  'Client:heldItemNotification': (id: bigint, item: Item, inventoySlot: number, hotbarSlot: number, containerId: number) => void,
  'Client:sendMessage': (message: string, type: TextType) => void,
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

  public position: PlayerPosition = new PlayerPosition(0, 67, 0, 0, 0, 0)

  constructor(player: IPlayerCreate) {
    super(player.username, 'stardust:player')

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

  public sendMessage(message: string, type = TextType.RAW): void {
    this.emit('Client:sendMessage', message, type)
  }

  public move(pos: PlayerPosition): void {
    this.position.update(pos)

    Server.i.updatePlayerLocation(this)
  }

  public teleport(x: number, y: number, z: number): void {
    this.position.update(x, y, z)

    Server.i.updatePlayerLocation(this, true)
  }

  public notifySelf(data?: any[]): void {
    this.notifyPlayers([this], data)
  }

  public notifyContainers(players: Player[] = [this]): void {
    for(const container of this.containers) {
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

}