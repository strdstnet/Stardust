import { ConnectionRequest } from '../../../network/raknet/ConnectionRequest'

describe('ConnectionRequest', () => {
  it('encodes & decodes correctly', () => {
    const sendPingTime = 100n
    const clientId = 0x00000000003c6d0dn
    const hasSecurity = false

    const encoded = new ConnectionRequest({
      sendPingTime,
      clientId,
      hasSecurity,
    }).encode()

    const decoded = new ConnectionRequest().decode(encoded.clone())

    expect(decoded.sendPingTime).toEqual(sendPingTime)
    expect(decoded.clientId).toEqual(clientId)
    expect(decoded.hasSecurity).toEqual(hasSecurity)
  })
})
