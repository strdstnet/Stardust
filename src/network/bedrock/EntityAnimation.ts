import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IEntityAnimation {
  entityRuntimeId: bigint,
  event: number,
  data: number
}

export class EntityAnimation extends BatchedPacket<IEntityAnimation> {

  constructor(p?: IEntityAnimation) {
    super(Packets.ENTITY_ANIMATION, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'event', parser: DataType.BYTE },
      { name: 'data', parser: DataType.VARINT },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
