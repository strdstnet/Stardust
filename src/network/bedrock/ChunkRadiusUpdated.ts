import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IChunkRadiusUpdated {
  radius: number,
}

export class ChunkRadiusUpdated extends BatchedPacket<IChunkRadiusUpdated> {

  constructor(p?: IChunkRadiusUpdated) {
    super(Packets.CHUNK_RADIUS_UPDATED, [
      { name: 'radius', parser: DataType.VARINT },
    ])

    if(p) this.props = p
  }

}
