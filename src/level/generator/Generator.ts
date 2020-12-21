import { Chunk } from '../Chunk'

export abstract class Generator {

  public async chunk(x: number, z: number): Promise<Chunk> {
    return null as any as Chunk
  }

}