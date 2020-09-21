import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Metadata } from '../../entity/Metadata'

interface IEntityNotification {
  entityRuntimeId: bigint,
  metadata: Metadata,
}

export class EntityNotification extends BatchedPacket<IEntityNotification> {

  constructor(p?: IEntityNotification) {
    super(Packets.ENTITY_NOTIFICATION, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'metdata', parser: DataType.ENTITY_METADATA },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
