import { CompoundTag } from '../nbt'
import { PlayerPosition } from '../types'
import { ensureLength } from '../utils'
import { SubChunk } from './SubChunk'

export class Chunk {

  public static readonly MAX_SUB_CHUNKS = 16
  public static readonly BIOME_DATA_SIZE = 256
  public static readonly HEIGHT_MAP_SIZE = 256

  public readonly height = Chunk.MAX_SUB_CHUNKS

  public subChunks: SubChunk[] = []
  public heightMap: number[] = []

  constructor(
    public x: number,
    public z: number,
    subChunks: SubChunk[],
    public entityTags: CompoundTag[],
    public tileTags: CompoundTag[],
    public biomeData: number[],
    heightMap: number[],
  ) {
    for(let i = 0; i < this.height; i++) {
      this.subChunks[i] = subChunks[i] || SubChunk.empty
    }

    ensureLength(this.biomeData, Chunk.BIOME_DATA_SIZE)

    for(let i = 0; i < Chunk.HEIGHT_MAP_SIZE; i++) {
      this.heightMap[i] = heightMap[i] || (this.height * 16)
    }
  }

  public highestNonEmptySubChunk(): number {
    for(let y = this.subChunks.length - 1; y >= 0; y--) {
      if(this.subChunks[y].empty) continue

      return y
    }

    return -1
  }

  public static getChunkCoords(pos: PlayerPosition): [number, number] {
    return [Math.floor(pos.location.x) >> 4, Math.floor(pos.location.z) >> 4]
  }

}