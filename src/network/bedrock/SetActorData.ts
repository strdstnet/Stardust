import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { ParserType } from '../Packet'

interface ISetActorData {
  entityRuntimeId: bigint,
  metadata: any[], // tmp
}

export class SetActorData extends BatchedPacket<ISetActorData> {

  constructor(p?: ISetActorData) {
    super(Packets.AVAILABLE_COMMANDS, [
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
