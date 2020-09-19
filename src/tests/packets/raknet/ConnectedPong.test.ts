import { ConnectedPong } from '../../../network/raknet/ConnectedPong'

describe('ConnectedPong', () => {
  it('encodes & decodes correctly', () => {
    const pingTime = 100n
    const pongTime = 101n

    const encoded = new ConnectedPong({
      pingTime,
      pongTime,
    }).encode()

    const decoded = new ConnectedPong().decode(encoded.clone())

    expect(decoded.pingTime).toEqual(pingTime)
    expect(decoded.pongTime).toEqual(pongTime)
  })
})
