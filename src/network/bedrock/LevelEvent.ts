import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface ILevelEvent {
  eventId: number,
  x: number,
  y: number,
  z: number,
  data: number,
}

export class LevelEvent extends BatchedPacket<ILevelEvent> {

  constructor(p?: ILevelEvent) {
    super(Packets.LEVEL_EVENT, [
      { name: 'eventId', parser: DataType.VARINT },
      { name: 'x', parser: DataType.L_FLOAT },
      { name: 'y', parser: DataType.L_FLOAT },
      { name: 'z', parser: DataType.L_FLOAT },
      { name: 'data', parser: DataType.VARINT },
    ])

    if(p) this.props = p
  }

}
