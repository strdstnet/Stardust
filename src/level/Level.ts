import { Chunk } from './Chunk'
import { Generator } from './generator/Generator'
import { Anvil } from './generator/Anvil'
import { Flat } from './generator/Flat'

export class Level {

  private static LAST_ID = 0

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  constructor(public name: string, public generator: Generator) {
    this.loadChunk(0, 0)
  }

  private async loadChunk(x: number, z: number): Promise<Chunk> {
    const chunk = await this.generator.chunk(x, z)
    // this.chunkCache.set(Level.getChunkId(x, z), chunk)

    return chunk
  }

  public static getChunkId(x: number, z: number): string {
    return `chunk:${x}:${z}`
  }

  public static TestWorld(): Level {
    return new Level('TestLevel', new Anvil('1_12_2'))
  }

  public static Flat(): Level {
    return new Level('TestLevel', new Flat())
  }

  public async getChunkAt(x: number, z: number): Promise<Chunk> {
    // const inCache = this.chunkCache.get(Level.getChunkId(x, z))
    // return inCache ? inCache : await this.loadChunk(x, z)
    return this.loadChunk(x, z)
  }

  // public get baseChunk(): Chunk {
  //   return this.getChunkAt(0, 0) as Chunk
  // }

}