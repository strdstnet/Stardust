import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IRemoveEntity {
  entityRuntimeId: bigint,
}

export class RemoveEntity extends BatchedPacket<IRemoveEntity> {

  constructor(p?: IRemoveEntity) {
    super(Packets.REMOVE_ENTITY, [
      { name: 'entityRuntimeId', parser: DataType.VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
