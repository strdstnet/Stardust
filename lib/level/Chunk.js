"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chunk = exports.ensureLength = void 0;
const SubChunk_1 = require("./SubChunk");
function ensureLength(arr, length, filler = 0) {
    if (arr.length === length)
        return;
    if (arr.length > length) {
        arr.splice(0, length);
    }
    for (let i = 0; i < length; i++) {
        const v = arr[i];
        if (typeof v === 'undefined' || v === null)
            arr[i] = filler;
    }
}
exports.ensureLength = ensureLength;
class Chunk {
    constructor(x, z, subChunks, entityTags, tileTags, biomeData, heightMap) {
        this.x = x;
        this.z = z;
        this.entityTags = entityTags;
        this.tileTags = tileTags;
        this.biomeData = biomeData;
        this.height = Chunk.MAX_SUB_CHUNKS;
        this.subChunks = [];
        this.heightMap = [];
        for (let i = 0; i < this.height; i++) {
            this.subChunks[i] = subChunks[i] || SubChunk_1.SubChunk.empty;
        }
        ensureLength(this.biomeData, Chunk.BIOME_DATA_SIZE);
        for (let i = 0; i < Chunk.HEIGHT_MAP_SIZE; i++) {
            this.heightMap[i] = heightMap[i] || (this.height * 16);
        }
    }
    highestNonEmptySubChunk() {
        for (let y = this.subChunks.length - 1; y >= 0; y--) {
            if (this.subChunks[y].empty)
                continue;
            return y;
        }
        return -1;
    }
    static getChunkCoords(...args) {
        const x = args.length > 1 ? args[0] : args[0].location.x;
        const z = args.length > 1 ? args[1] : args[0].location.z;
        return [Math.floor(x) >> 4, Math.floor(z) >> 4];
    }
}
exports.Chunk = Chunk;
Chunk.MAX_SUB_CHUNKS = 16;
Chunk.BIOME_DATA_SIZE = 256;
Chunk.HEIGHT_MAP_SIZE = 256;
