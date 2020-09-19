import { ConnectedPing } from '../../../network/raknet/ConnectedPing'

describe('ConnectedPing', () => {
  it('encodes & decodes correctly', () => {
    const time = 100n

    const encoded = new ConnectedPing({
      time,
    }).encode()

    const decoded = new ConnectedPing().decode(encoded.clone())

    expect(decoded.time).toEqual(time)
  })
})
