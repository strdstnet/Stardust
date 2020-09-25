import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IBlockActorData {
  x: number,
  y: number,
  z: number,
  namedTag: string,
}

export class BlockActorData extends BatchedPacket<IBlockActorData> {

  constructor(p?: IBlockActorData) {
    super(Packets.BLOCK_ACTOR_DATA, [
      { name: 'x', parser: DataType.VARINT },
      { name: 'y', parser: DataType.U_VARINT },
      { name: 'z', parser: DataType.VARINT },
      { name: 'namedTag', parser: DataType.STRING },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
