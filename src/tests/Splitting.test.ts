import { PacketBatch, PlayStatus } from '../network/bedrock'
import { PlayStatusType, Protocol } from '../types'
import { bundlePackets } from '../utils/parseBundledPackets'

describe('Splitting', () => {
  it('splits shit correctly', () => {
    const batch = new PacketBatch({
      packets: [
        new PlayStatus({
          status: PlayStatusType.SUCCESS,
        }),
      ],
    })

    const mtuSize = Protocol.DEFAULT_MTU
    const [bundles] = bundlePackets([batch], 0, -1, mtuSize)

    expect(bundles.length).toBeGreaterThan(1)

    for(const [idx, bundle] of bundles.entries()) {
      const encoded = bundle.encode()

      expect(encoded.length).toBeLessThanOrEqual(mtuSize)

      console.log(encoded.buf)
    }

    // const buf = Buffer.alloc(1)
    // buf[0] = byte
    // const data = new PacketData(buf)

    // expect(data.readByte()).toEqual(byte)
  })
})
