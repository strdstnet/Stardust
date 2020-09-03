import { Human } from './entity'

interface IPlayerEvents {
  'Client:entityNotification': (id: bigint, meta: any[]) => void,
}

export class Player extends Human<IPlayerEvents> {

  public autoJump = true
  public allowFlight = false
  public flying = false

  constructor(name: string) {
    super(name, 'stardust:player')
  }

  public isSpectator(): boolean {
    return true
  }

  public notifySelf(data?: any[]): void {
    this.notifyPlayers([this], data)
  }

}