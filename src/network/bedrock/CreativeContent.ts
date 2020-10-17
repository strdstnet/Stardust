import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface ICreativeContent {
  entries: number,
}

export class CreativeContent extends BatchedPacket<ICreativeContent> {

  constructor(p?: ICreativeContent) {
    super(Packets.CREATIVE_CONTENT, [
      { name: 'entries', parser: DataType.U_VARINT },
    ])

    if(p) this.props = p
  }

}
