import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'
import { ParserType } from '../Packet'
import { Chunk } from '../../level'

interface ILevelChunk {
  chunk: Chunk,
  cache: boolean,
  usedHashes: Array<bigint>,
}

export class LevelChunk extends BatchedPacket<ILevelChunk> {

  public static empty = new LevelChunk({
    chunk: new Chunk(0, 0, [], [], [], [], []),
    cache: false,
    usedHashes: [],
  })

  constructor(p?: ILevelChunk) {
    super(Packets.LEVEL_CHUNK, [
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeVarInt(props.chunk.x)
            data.writeVarInt(props.chunk.z)
            data.writeUnsignedVarInt(props.chunk.highestNonEmptySubChunk() + 1)
            // data.writeUnsignedVarInt(1)
          }
        },
      },
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
      { name: 'chunk', parser: DataType.CHUNK },
    ])

    if(p) this.props = p
  }

}
