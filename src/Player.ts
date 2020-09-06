import { Human } from './entity'
import { Inventory } from './inventory'
import { UUID } from './utils'

interface IPlayerEvents {
  'Client:entityNotification': (id: bigint, meta: any[]) => void,
  'Client:inventoryNotification': (inventory: Inventory) => void,
}

interface IPlayerCreate {
  username: string,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
}

export class Player extends Human<IPlayerEvents> {

  public autoJump = true
  public allowFlight = false
  public flying = false

  public inventories: Inventory[] = []

  public username: string
  public UUID: UUID
  public clientUUID: string
  public XUID: string
  public identityPublicKey: string
  public clientId: bigint

  constructor(player: IPlayerCreate) {
    super(player.username, 'stardust:player')

    this.username = player.username
    this.UUID = new UUID(player.clientUUID)
    this.clientUUID = player.clientUUID
    this.XUID = player.XUID
    this.identityPublicKey = player.identityPublicKey
    this.clientId = player.clientId
  }

  public isSpectator(): boolean {
    return true
  }

  public notifySelf(data?: any[]): void {
    this.notifyPlayers([this], data)
  }

  public notifyInventories(players: Player[] = [this]): void {
    for(const inventory of this.inventories) {
      for(const player of players) {
        player.emit('Client:inventoryNotification', inventory)
      }
    }
  }

}