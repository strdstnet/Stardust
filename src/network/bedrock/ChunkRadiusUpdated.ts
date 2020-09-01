import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'

interface IChunkRadiusUpdated {
  radius: number,
}

export class ChunkRadiusUpdated extends BatchedPacket<IChunkRadiusUpdated> {

  constructor(p?: IChunkRadiusUpdated) {
    super(Packets.REQUEST_CHUNK_RADIUS, [
      { name: 'radius', parser: DataType.VARINT },
    ])

    if(p) this.props = p
  }

}
