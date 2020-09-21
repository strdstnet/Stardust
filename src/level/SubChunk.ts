import { ensureLength } from './Chunk'

export class SubChunk {

  constructor(
    public data: number[],
    public blockData: number[], // Block IDs
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
    return new SubChunk([], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [], [])
  }

  public static reorderBytes(bytes: number[]): number[] {
    if(bytes.every(v => v === bytes[0])) return bytes

    let i = 0
    const result = []
    for(let x = 0; x < 16; x++) {
      const zM = x + 256
      for(let z = x; z < zM; z += 16) {
        const yM = z + 4096
        for(let y = z; y < yM; y += 256) {
          result[i] = bytes[y]
          i++
        }
      }
    }

    return result
  }

  public static reorderNibbles(nibbles: number[], empty = 0): number[] {
    if(nibbles.every(v => v === nibbles[0])) return nibbles

    let i = 0
    const result = []
    for(let x = 0; x < 8; x++) {
      for(let z = 0; z < 16; z++) {
        const zx = ((z << 3) | x)
        for(let y = 0; y < 8; y++) {
          const j = ((y << 8) | zx)
          const j80 = (j | 0x80)
          if(nibbles[j] !== empty && nibbles[j80] !== empty) {
            const i1 = nibbles[j]
            const i2 = nibbles[j80]
            result[i]        = (i2 << 4) | (i1 & 0x0f)
            result[i | 0x80] = (i1 >> 4) | (i2 & 0xf0)
          }
          i++
        }
      }
      i += 128
    }

    return result
  }

  public get empty(): boolean {
    return this.blockData.every(v => v === 0) &&
      this.skyLightData.every(v => v === 255) &&
      this.blockLightData.every(v => v === 0)
  }

}