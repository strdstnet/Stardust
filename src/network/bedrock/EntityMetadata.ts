import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Metadata } from '../../entity/Metadata'

interface IEntityMetadata {
  entityRuntimeId: bigint,
  metadata: Metadata,
}

export class EntityMetadata extends BatchedPacket<IEntityMetadata> {

  constructor(p?: Partial<IEntityMetadata>) {
    super(Packets.ENTITY_METADATA, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'metadata', parser: DataType.ENTITY_METADATA, resolve: () => new Metadata() },
    ])

    if(p) this.props = Object.assign({}, p as IEntityMetadata)
  }

}
