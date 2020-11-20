import { Event } from '@strdstnet/utils.events'
import { Player } from '../Player'

export class PlayerEvent extends Event<{
  player: Player,
}> {

  public get player(): Player {
    return this.data.player
  }

}
