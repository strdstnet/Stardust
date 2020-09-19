import { IncompatibleProtocol } from '../../../network/raknet/IncompatibleProtocol'
import { Protocol } from '../../../types/protocol'

describe('IncompatibleProtocol', () => {
  it('encodes & decodes correctly', () => {
    const protocol = Protocol.PROTOCOL_VERSION
    const serverId = Protocol.SERVER_ID

    const encoded = new IncompatibleProtocol({
      protocol,
      serverId,
    }).encode()

    const decoded = new IncompatibleProtocol().decode(encoded.clone())

    expect(decoded.protocol).toEqual(protocol)
    expect(decoded.serverId).toEqual(serverId)
  })
})
