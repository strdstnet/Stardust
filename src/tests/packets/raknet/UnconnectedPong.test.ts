import { UnconnectedPong } from '../../../network/raknet/UnconnectedPong'

const motdOpts = {
  line1: 'this is',
  line2: 'a test',
  maxPlayers: 70,
  numPlayers: 69,
}

describe('UnconnectedPong', () => {
  it('encodes & decodes MOTD correctly', () => {
    const motd = UnconnectedPong.getMOTD(motdOpts)
    const parsed = UnconnectedPong.parseMOTD(motd)

    expect(parsed.line1).toEqual(motdOpts.line1)
    expect(parsed.line2).toEqual(motdOpts.line2)
    expect(parsed.maxPlayers).toEqual(motdOpts.maxPlayers)
    expect(parsed.numPlayers).toEqual(motdOpts.numPlayers)
  })
  it('encodes & decodes correctly', () => {
    const pingId = 100n
    const motd = UnconnectedPong.getMOTD(motdOpts)

    const encoded = new UnconnectedPong({
      pingId,
      motd,
    }).encode()

    const decoded = new UnconnectedPong().decode(encoded.clone())

    expect(decoded.pingId).toEqual(pingId)
    expect(decoded.motd).toEqual(motd)
  })
})
