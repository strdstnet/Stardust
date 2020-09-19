import { ConnectedPing } from '../../../network/raknet/ConnectedPing'
import { bundlePackets } from '../../../utils/parseBundledPackets'
import { Protocol } from '../../../types/protocol'

// describe('BundledPacket', () => {
//   it('encodes & decodes single packet correctly', () => {
//     const time = 100n

//     const encoded = bundlePackets([new ConnectedPing({
//       time,
//     })])

//     const packets = parseBundledPackets(encoded.clone())

//     expect(packets.length).toEqual(1)
//     expect(packets[0].id).toEqual(Packets.CONNECTED_PING)
//     expect((packets[0] as ConnectedPing).props.time).toEqual(time)
//   })
//   it('encodes & decodes multiple packets correctly', () => {
//     const time = 100n

//     const encoded = bundlePackets([
//       new ConnectedPing({
//         time,
//       }),
//       new ConnectedPing({
//         time,
//       }),
//     ])

//     const packets = parseBundledPackets(encoded.clone())

//     expect(packets.length).toEqual(2)
//     expect(packets[0].id).toEqual(Packets.CONNECTED_PING)
//     expect((packets[0] as ConnectedPing).props.time).toEqual(time)
//     expect(packets[1].id).toEqual(Packets.CONNECTED_PING)
//     expect((packets[1] as ConnectedPing).props.time).toEqual(time)
//   })
// })

describe('BundledPacket', () => {
  it('does shit', () => {
    const time = 100n

    const bundledPackets = [
      new ConnectedPing({
        time,
      }),
    ]
    const [bundles] = bundlePackets(bundledPackets, 0, -1, Protocol.DEFAULT_MTU)

    // console.log(bundles.length)
    // console.log(bundles)
    // console.log(bundles.map(b => b.props.packets[0].data.length))

    // const packets = parseBundledPackets(encoded.clone())

    // expect(packets.length).toEqual(1)
    // expect(packets[0].id).toEqual(Packets.CONNECTED_PING)
    // expect((packets[0] as ConnectedPing).props.time).toEqual(time)
  })
})
