import { Human } from './entity'

interface IPlayerEvents {
  
}

export class Player extends Human<IPlayerEvents> {

  constructor(name: string) {
    super(name, 'stardust:player')
  }

}