import { BundledPacket } from '../raknet/BundledPacket'
import { Packets } from '../../types/protocol'

interface ISetSpawnPosition {
  spawnType: number,
  coords: number[],
  forced: boolean,
}

export class SetSpawnPosition extends BundledPacket<ISetSpawnPosition> {

  constructor() {
    super(Packets.SET_SPAWN_POSITION, [])
  }

}
