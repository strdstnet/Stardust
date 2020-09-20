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
    expect(decoded.usedHashes).toEqual([])

    expect(decoded.chunk.x).toBe(x)
    expect(decoded.chunk.z).toBe(z)
    expect(decoded.chunk.highestNonEmptySubChunk() + 1).toBe(chunk.highestNonEmptySubChunk() + 1)
    expect(decoded.chunk.biomeData).toEqual(chunk.biomeData)

    for(let i = 0; i < decoded.chunk.subChunks.length; i++) {
      const subChunk = decoded.chunk.subChunks[i]

      expect(subChunk.data).toEqual(chunk.subChunks[i].data)
      expect(subChunk.blockData).toEqual(chunk.subChunks[i].blockData)
    }
  })
})
