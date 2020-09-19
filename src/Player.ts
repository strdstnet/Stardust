import { Human } from './entity'
import { Container } from './containers'
import { UUID, getSkinData } from './utils'
import { Login, TextType } from './network/bedrock'
import { ContainerId, SkinData } from './types'
import { Item } from './item/Item'
import { Server } from './Server'

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

  constructor(player: IPlayerCreate) {
    super(player.username, 'stardust:player')

    Object.assign(this, player)
    this.UUID = new UUID(player.clientUUID)
  }

  public static createFrom(login: Login): Player {
    const { props } = login

    return new Player({
      username: props.username,
      clientUUID: props.clientUUID,
      XUID: props.XUID,
      identityPublicKey: props.identityPublicKey,
      clientId: props.clientId,
      skinData: getSkinData(props),
    })
  }

  public isSpectator(): boolean {
    return true
  }

  public chat(message: string): void {
    Server.current.playerChat(this, message)
  }

  public sendMessage(message: string, type = TextType.CHAT): void {
    this.emit('Client:sendMessage', message, type)
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