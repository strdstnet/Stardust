import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IRequestChunkRadius {
  radius: number,
}

export class RequestChunkRadius extends BatchedPacket<IRequestChunkRadius> {

  constructor(p?: IRequestChunkRadius) {
    super(Packets.REQUEST_CHUNK_RADIUS, [
      { name: 'radius', parser: DataType.VARINT },
    ])

    if(p) this.props = p
  }

}
