import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'
import { ParserType } from '../Packet'

interface ILevelChunk {
  chunkX: number,
  chunkY: number,
  subChunks: number,
  cache: boolean,
  usedHashes: Array<bigint>,
  extra: string,
}

export class LevelChunk extends BatchedPacket<ILevelChunk> {

  public static empty = new LevelChunk({
    chunkX: 0,
    chunkY: 0,
    subChunks: 0,
    cache: false,
    usedHashes: [],
    extra: '',
  })

  constructor(p?: ILevelChunk) {
    super(Packets.LEVEL_CHUNK, [
      { name: 'chunkX', parser: DataType.VARINT },
      { name: 'chunkY', parser: DataType.VARINT },
      { name: 'subChunks', parser: DataType.U_VARINT },
      { name: 'cache', parser: DataType.BOOLEAN },
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            props.usedHashes = []
            if(props.cache) {
              const count = data.readUnsignedVarInt()
              for(let i = 0; i < count; i++) {
                props.usedHashes.push(data.readLLong())
              }
            }
          } else {
            if(props.cache) {
              data.writeUnsignedVarInt(props.usedHashes.length)

              for(const hash of props.usedHashes) {
                data.writeLLong(hash)
              }
            }
          }
        },
      },
      { name: 'extra', parser: DataType.STRING },
    ])

    if(p) this.props = p
  }

}
