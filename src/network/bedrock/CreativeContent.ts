import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'

interface ICreativeContent {
  // entries: number,
}

export class CreativeContent extends BatchedPacket<ICreativeContent> {

  constructor(p?: ICreativeContent) {
    super(Packets.CREATIVE_CONTENT, [
      // { name: 'entries', parser: DataType.U_VARINT },
      {
        name: 'content',
        parser({ type, data }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(0)
          }
        }
      }
    ])

    if(p) this.props = p
  }

}
