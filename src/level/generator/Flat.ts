import { Chunk } from '../Chunk'
import { SubChunk } from '../SubChunk'
import { Generator } from './Generator'

export class Flat extends Generator {

  public async chunk(x: number, z: number): Promise<Chunk> {
    const subChunks: SubChunk[] = []

    for(let i = 0; i < Chunk.MAX_SUB_CHUNKS; i++) {
      const blocks: number[] = []

      if(i === 0) {
        const stack = [7, 3, 3, 3, 2]

        for(let i2 = 0; i2 < 16 * 16; i2++) {
          blocks.push(...[...stack, ...Array(16 - stack.length).fill(0)])
        }
      }

      subChunks.push(new SubChunk(
        blocks,
        [],
        [],
        [],
      ))
    }

    return new Chunk(
      x, z,
      subChunks,
      [],
      [],
      [],
      [],
    )
  }

}