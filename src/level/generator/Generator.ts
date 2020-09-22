import { Chunk } from '../Chunk'

export abstract class Generator {

  public abstract async chunk(x: number, z: number): Promise<Chunk>

}