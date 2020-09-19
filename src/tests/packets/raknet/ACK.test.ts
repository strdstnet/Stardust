import { ACK } from '../../../network/raknet/ACK'

describe('ACK', () => {
  it('encodes & decodes single sequence correctly', () => {
    const sequence = 50

    const encoded = new ACK([sequence]).encode()

    const decoded = new ACK().decode(encoded.clone())

    expect(decoded.sequences.length).toEqual(1)
    expect(decoded.sequences[0]).toEqual(sequence)
  })
  it('encodes & decodes multiple sequences correctly', () => {
    const sequences = [23, 26, 27, 30, 31]

    const encoded = new ACK(sequences).encode()

    const decoded = new ACK().decode(encoded.clone())

    expect(decoded.sequences.length).toEqual(sequences.length)

    for(const [index, sequence] of sequences.entries()) {
      expect(decoded.sequences[index]).toEqual(sequence)
    }
  })
})
