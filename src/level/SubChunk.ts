import { ensureLength } from '../utils'

export class SubChunk {

  constructor(
    public data: number[],
    public blockData: number[],
    public skyLightData: number[],
    public blockLightData: number[],
  ) {
    ensureLength(this.data, 2048)
    ensureLength(this.blockData, 4096)
    ensureLength(this.skyLightData, 2048, 255)
    ensureLength(this.blockLightData, 2048)
  }

  public static get empty(): SubChunk {
    return new SubChunk([], [], [], [])
  }

  public static get grassPlatform(): SubChunk {
    return new SubChunk([], [2], [], [])
  }

}