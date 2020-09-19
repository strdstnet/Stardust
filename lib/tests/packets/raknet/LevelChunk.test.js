"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Level_1 = require("../../../level/Level");
const LevelChunk_1 = require("../../../network/bedrock/LevelChunk");
const BinaryData_1 = require("../../../utils/BinaryData");
describe('LevelChunk', () => {
    it('encodes & decodes correctly', async () => {
        const level = Level_1.Level.TestWorld();
        const x = 0;
        const z = 0;
        const chunk = await level.getChunkAt(x, z);
        const encoded = new LevelChunk_1.LevelChunk({
            chunk,
            cache: false,
            usedHashes: [],
        }).encode().toBuffer();
        const decoded = new LevelChunk_1.LevelChunk().parse(new BinaryData_1.BinaryData(encoded)).props;
        expect(decoded.cache).toBe(false);
        expect(decoded.usedHashes).toBe([]);
        expect(decoded.chunk.x).toBe(x);
        expect(decoded.chunk.z).toBe(z);
        // expect(decoded.chunk.subChunks.length).toBe(chunk.subChunks.length)
        expect(decoded.chunk).toBe(chunk);
    });
});
