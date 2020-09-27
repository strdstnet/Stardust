import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface ISetHealth {
  health: number,
}

export class SetHealth extends BatchedPacket<ISetHealth> {

  constructor(p?: ISetHealth) {
    super(Packets.SET_HEALTH, [
      { name: 'health', parser: DataType.VARINT },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
