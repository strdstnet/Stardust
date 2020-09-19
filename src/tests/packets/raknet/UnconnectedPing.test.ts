import { UnconnectedPing } from '../../../network/raknet/UnconnectedPing'

describe('UnconnectedPing', () => {
  it('encodes & decodes correctly', () => {
    const pingId = 100n
    const clientId = 0x00000000003c6d0dn

    const encoded = new UnconnectedPing({
      pingId,
      clientId,
    }).encode()

    const decoded = new UnconnectedPing().decode(encoded.clone())

    expect(decoded.pingId).toEqual(pingId)
    expect(decoded.clientId).toEqual(clientId)
  })
})
