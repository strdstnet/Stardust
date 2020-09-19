import { NewIncomingConnection } from '../../../network/raknet/NewIncomingConnection'
import { Protocol } from '../../../types/protocol'

describe('NewIncomingConnection', () => {
  it('encodes & decodes correctly', () => {
    const address = { ip: '83.1.157.191', port: 12345, family: 4 }
    const systemAddresses = new Array(Protocol.SYSTEM_ADDRESSES).fill({ ip: '83.1.157.191', port: 12345, family: 4 })
    const pingTime = 100n
    const pongTime = 101n

    const encoded = new NewIncomingConnection({
      address,
      systemAddresses,
      pingTime,
      pongTime,
    }).encode()

    const decoded = new NewIncomingConnection().decode(encoded.clone())

    expect(decoded.address).toEqual(address)
    expect(decoded.systemAddresses).toEqual(systemAddresses)
    expect(decoded.pingTime).toEqual(pingTime)
    expect(decoded.pongTime).toEqual(pongTime)
  })
})
