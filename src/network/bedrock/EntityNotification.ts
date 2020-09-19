import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'

interface IEntityNotification {
  entityRuntimeId: bigint,
  metadata: any[], // tmp
}

export class EntityNotification extends BatchedPacket<IEntityNotification> {

  constructor(p?: IEntityNotification) {
    super(Packets.ENTITY_NOTIFICATION, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        // TODO: Implement metadata
        name: 'metadata',
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.metadata.length)
          } else {
            props.metadata = new Array(data.readUnsignedVarInt())
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
