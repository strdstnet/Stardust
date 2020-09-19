import { Level } from '../../../level/Level'
import { LevelChunk } from '../../../network/bedrock/LevelChunk'
import { BinaryData } from '../../../utils/BinaryData'

describe('LevelChunk', () => {
  it('encodes & decodes correctly', async () => {
    const level = Level.TestWorld()

    const x = 0
    const z = 0
    const chunk = await level.getChunkAt(x, z)

    const encoded = new LevelChunk({
      chunk,
      cache: false,
      usedHashes: [],
    }).encode().toBuffer()

    const decoded = new LevelChunk().parse(new BinaryData(encoded)).props

    expect(decoded.cache).toBe(false)
    console.log(decoded.usedHashes)
    expect(decoded.usedHashes).toEqual([])

    expect(decoded.chunk.x).toBe(x)
    expect(decoded.chunk.z).toBe(z)
    // expect(decoded.chunk).toEqual(chunk)
    console.log(decoded.chunk.highestNonEmptySubChunk())
    expect(decoded.chunk.highestNonEmptySubChunk() + 1).toBe(chunk.highestNonEmptySubChunk() + 1)
  })
})
