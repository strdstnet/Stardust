import { PlayStatusType } from '../types/world'
import { EntityPosition } from '../entity/EntityPosition'
import { BundledPacket, bundlePackets, IBundledPacket, PacketBatch, PacketBundle, PlayStatus, StartGame } from '@strdstnet/protocol'
import { BinaryData } from '@strdstnet/utils.binary'

describe('Splitting', () => {
  it('splits shit correctly', () => {
    const batch = new PacketBatch({
      packets: [
        new PlayStatus({
          status: PlayStatusType.SUCCESS,
        }),
      ],
    })

    const mtuSize = 1350
    const [bundles] = bundlePackets([batch], 0, -1, mtuSize)

    expect(bundles.length).toBe(1)
  })
  it('splits correctly', () => {
    const pos = new EntityPosition(0, 0, 0, 0, 0)

    const batch = new PacketBatch({
      packets: [
        new StartGame({
          entityUniqueId: 1n,
          entityRuntimeId: 1n,
          position: pos.coords,
          pitch: pos.pitch,
          yaw: pos.yaw,
          enableNewInventorySystem: true,
          playerGamemode: 2,
        }),
      ],
    })

    const mtuSize = 1350
    const [ bundles ] = bundlePackets([batch], 0, -1, mtuSize)

    expect(bundles.length).toBeGreaterThan(1)

    const splitQueue: {
      [splitId: number]: BundledPacket<any>,
    } = {}

    for(const [, bundle] of bundles.entries()) {
      const encoded = new BinaryData(bundle.encode().toBuffer())

      expect(encoded.length).toBeLessThanOrEqual(mtuSize)

      const { packets } = new PacketBundle().decode(encoded)

      for(const packet of packets) {
        const props = packet.props as IBundledPacket

        expect(props.hasSplit).toBe(true)
        expect(packet.hasBeenProcessed).toBe(false)

        if(props.splitIndex === 0) {
          packet.data.pos = packet.data.length
          splitQueue[packet.props.splitId] = packet
        } else {
          const queue = splitQueue[props.splitId]

          expect(queue).toBeTruthy()

          queue.append(packet.data)

          if(props.splitIndex === props.splitCount - 1) {
            queue.data.pos = 0
            queue.decode()
            queue.hasBeenProcessed = true

            expect(queue).toBeInstanceOf(PacketBatch)
            expect(queue.props.packets[0]).toBeInstanceOf(StartGame)

            console.log(queue.props.packets[0].props)
          }
        }
      }
    }
  })
})
