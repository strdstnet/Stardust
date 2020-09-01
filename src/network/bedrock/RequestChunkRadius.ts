import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'

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
