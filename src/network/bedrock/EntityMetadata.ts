import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Metadata } from '../../entity/Metadata'

interface IEntityMetadata {
  entityRuntimeId: bigint,
  metadata: Metadata,
  tick: bigint,
}

export class EntityMetadata extends BatchedPacket<IEntityMetadata> {

  constructor(p?: IEntityMetadata) {
    super(Packets.ENTITY_METADATA, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'metadata', parser: DataType.ENTITY_METADATA },
      { name: 'tick', parser: DataType.U_VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
