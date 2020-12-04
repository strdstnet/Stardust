import { Dimension } from '../types/world'
import { Vector3 } from '@strdstnet/utils.binary'
import { ChangeDimension, PacketBatch, Packets } from '@strdstnet/protocol'

describe('PacketBatch', () => {
  it('encodes & decodes single packet correctly', () => {
    const encoded = new PacketBatch({
      packets: [new ChangeDimension({
        dimension: Dimension.END,
        position: new Vector3(1, 2, 3),
        respawn: true,
      })],
    }).encode()

    const decoded = new PacketBatch().decode(encoded.clone())

    expect(decoded.packets.length).toEqual(1)
    expect(decoded.packets[0].id).toEqual(Packets.CHANGE_DIMENSION)
  })
  it('encodes & decodes mutiple packets correctly', () => {
    const encoded = new PacketBatch({
      packets: [
        new ChangeDimension({
          dimension: Dimension.END,
          position: new Vector3(1, 2, 3),
          respawn: true,
        }),
        new ChangeDimension({
          dimension: Dimension.NETHER,
          position: new Vector3(3, 1, 2),
          respawn: false,
        }),
      ],
    }).encode()

    const decoded = new PacketBatch().decode(encoded.clone())

    expect(decoded.packets.length).toEqual(2)
    expect(decoded.packets[0].id).toEqual(Packets.CHANGE_DIMENSION)
    expect(decoded.packets[1].id).toEqual(Packets.CHANGE_DIMENSION)
  })
})
