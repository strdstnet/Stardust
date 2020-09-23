import { Chunk } from './Chunk'
import { Generator } from './generator/Generator'
import { Anvil } from './generator/Anvil'
import { Flat } from './generator/Flat'
import { Block } from '../block/Block'
import { BlockMap } from '../block/BlockMap'

export class Level {

  private static LAST_ID = 0

  private static Y_MASK = 0xFF
  private static MAX_HEIGHT = 256

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  private blockCache: Map<number, Block> = new Map()

  constructor(public name: string, public generator: Generator) {}

  public async init(): Promise<void> {
    await this.loadChunk(0, 0)
    await this.loadChunk(0, -1)
    await this.loadChunk(0, 1)
    await this.loadChunk(1, 0)
    await this.loadChunk(1, 1)
    await this.loadChunk(1, -1)
    await this.loadChunk(-1, 0)
    await this.loadChunk(-1, 1)
    await this.loadChunk(-1, -1)
  }

  public static getChunkId(x: number, z: number): string {
    return `chunk:${x}:${z}`
  }

  public static getChunkIndex(x: number, z: number): number {
    return ((x & 0xFFFFFFFF) << 32) | (z & 0xFFFFFFFF)
  }

  public static getBlockIndex(x: number, y: number, z: number): number {
    if(y < 0 || y >= Level.MAX_HEIGHT) {
      throw new Error(`Y should be > 0 and < ${Level.MAX_HEIGHT}. Got ${y}`)
    }

    return ((x & 0xFFFFFFFF) << 36) | ((y & Level.Y_MASK) << 28) | (z & 0xFFFFFFFF)
  }

  public static getBlockChunkIndex(x: number, y: number, z: number): number {
    return (y << 8) || ((z & 0xf) << 4) | (x & 0xf)
  }

  public static TestWorld(): Level {
    return new Level('TestLevel', new Anvil('1_12_2'))
  }

  public static Flat(): Level {
    return new Level('TestLevel', new Flat())
  }

  public async loadChunk(x: number, z: number): Promise<Chunk> {
    const chunk = await this.generator.chunk(x, z)
    this.chunkCache.set(Level.getChunkId(x, z), chunk)

    return chunk
  }

  public async getChunkAt(x: number, z: number): Promise<Chunk> {
    console.log(x, z, Level.getChunkId(x, z))
    const inCache = this.chunkCache.get(Level.getChunkId(x, z))
    console.log(inCache ? [inCache.x, inCache.z] : null)
    return inCache ? inCache : await this.loadChunk(x, z)


    // return this.loadChunk(x, z)
  }

  public getBlockAt(x: number, y: number, z: number): Block {
    const index = Level.getBlockIndex(x, y, z)

    const cached = this.blockCache.get(index)
    if(cached) return cached

    const chunkIndex = Level.getChunkId(x >> 4, z >> 4)
    const chunk = this.chunkCache.get(chunkIndex)

    if(!chunk) throw new Error('Tried getting block in uncached chunk')

    // const blockIndex = Level.getBlockChunkIndex(x, y, z)

    return chunk.getBlockAt(x & 0x0f, y, z & 0x0f)
  }

  public async setBlock(x: number, y: number, z: number, block: Block | string): Promise<void> {
    if(typeof block === 'string') block = BlockMap.get(block)

    // const chunkIndex = Level.getChunkId(x >> 4, z >> 4)

    // const chunk = this.chunkCache.get(chunkIndex)
    const chunkX = x >> 4
    const chunkZ = z >> 4
    const chunk = await this.getChunkAt(chunkX, chunkZ)
    if(!chunk) throw new Error('Tried setting block in uncached chunk')



    console.log(x & 0x0f, z & 0x0f)
    chunk.setBlock(x & 0x0f, y, z & 0x0f, block)
  }

  // public get baseChunk(): Chunk {
  //   return this.getChunkAt(0, 0) as Chunk
  // }

}