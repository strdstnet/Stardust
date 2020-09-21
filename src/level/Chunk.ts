import { EntityPosition } from '../entity/EntityPosition'
import { CompoundTag } from '../nbt/CompoundTag'
import { SubChunk } from './SubChunk'

export function ensureLength(arr: number[], length: number, filler = 0): void {
  if(arr.length === length) return

  if(arr.length > length) {
    arr.splice(0, length)
  }

  for(let i = 0; i < length; i++) {
    const v = arr[i]
    if(typeof v === 'undefined' || v === null) arr[i] = filler
  }
}

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

  public static getChunkCoords(pos: EntityPosition): [number, number]
  public static getChunkCoords(blockX: number, blockZ: number): [number, number]
  public static getChunkCoords(...args: any[]): [number, number] {
    const x = args.length > 1 ? args[0] : args[0].x
    const z = args.length > 1 ? args[1] : args[0].z

    return [Math.floor(x) >> 4, Math.floor(z) >> 4]
  }

}