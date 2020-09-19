"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubChunk = void 0;
const Chunk_1 = require("./Chunk");
class SubChunk {
    constructor(data, blockData, // Block IDs
    skyLightData, blockLightData) {
        this.data = data;
        this.blockData = blockData;
        this.skyLightData = skyLightData;
        this.blockLightData = blockLightData;
        Chunk_1.ensureLength(this.data, 2048);
        Chunk_1.ensureLength(this.blockData, 4096);
        Chunk_1.ensureLength(this.skyLightData, 2048, 255);
        Chunk_1.ensureLength(this.blockLightData, 2048);
    }
    static get empty() {
        return new SubChunk([], [], [], []);
    }
    static get grassPlatform() {
        return new SubChunk([], [2], [], []);
    }
    get empty() {
        return this.blockData.every(v => v === 0) &&
            this.skyLightData.every(v => v === 255) &&
            this.blockLightData.every(v => v === 0);
    }
}
exports.SubChunk = SubChunk;
