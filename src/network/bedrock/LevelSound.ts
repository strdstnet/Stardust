import { BatchedPacket } from './BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { Vector3 } from 'math3d'

interface ILevelSound {
  sound: number,
  position: Vector3,
  extraData: number,
  entityType: string,
  isBabyMob: boolean,
  disableRelativeVolume: boolean
}

export class LevelSound extends BatchedPacket<ILevelSound> {

  constructor(p?: ILevelSound) {
    super(Packets.LEVEL_SOUND, [
      { name: 'sound', parser: DataType.U_VARINT },
      { name: 'position', parser: DataType.VECTOR3 },
      { name: 'extraData', parser: DataType.VARINT },
      { name: 'entityType', parser: DataType.STRING },
      { name: 'isBabyMob', parser: DataType.BOOLEAN },
      { name: 'disableRelativeVolume', parser: DataType.BOOLEAN },
    ])

    if(p) this.props = p
  }

}
