"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NAK_1 = require("../../../network/raknet/NAK");
describe('ACK', () => {
    it('encodes & decodes single sequence correctly', () => {
        const sequence = 50;
        const encoded = new NAK_1.NAK([sequence]).encode();
        const decoded = new NAK_1.NAK().decode(encoded.clone());
        expect(decoded.sequences.length).toEqual(1);
        expect(decoded.sequences[0]).toEqual(sequence);
    });
    it('encodes & decodes multiple sequences correctly', () => {
        const sequences = [23, 26, 27, 30, 31];
        const encoded = new NAK_1.NAK(sequences).encode();
        const decoded = new NAK_1.NAK().decode(encoded.clone());
        expect(decoded.sequences.length).toEqual(sequences.length);
        for (const [index, sequence] of sequences.entries()) {
            expect(decoded.sequences[index]).toEqual(sequence);
        }
    });
});
