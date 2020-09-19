"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelChunk = void 0;
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const Packet_1 = require("../Packet");
const Chunk_1 = require("../../level/Chunk");
class LevelChunk extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        let subChunkCount = p ? p.chunk.subChunks.length : 0;
        super(protocol_1.Packets.LEVEL_CHUNK, [
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeVarInt(props.chunk.x);
                        data.writeVarInt(props.chunk.z);
                        data.writeUnsignedVarInt(props.chunk.highestNonEmptySubChunk() + 1);
                        // data.writeUnsignedVarInt(1)
                    }
                    else {
                        props.chunk = new Chunk_1.Chunk(data.readVarInt(), data.readVarInt(), [], [], [], [], []);
                        subChunkCount = data.readUnsignedVarInt();
                    }
                },
            },
            { name: 'cache', parser: data_1.DataType.BOOLEAN },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.usedHashes = [];
                        if (props.cache) {
                            const count = data.readUnsignedVarInt();
                            for (let i = 0; i < count; i++) {
                                props.usedHashes.push(data.readLLong());
                            }
                        }
                    }
                    else {
                        if (props.cache) {
                            data.writeUnsignedVarInt(props.usedHashes.length);
                            for (const hash of props.usedHashes) {
                                data.writeLLong(hash);
                            }
                        }
                    }
                },
            },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeChunk(props.chunk);
                    }
                    else {
                        data.readChunkData(props.chunk, subChunkCount);
                    }
                },
            },
        ]);
        if (p)
            this.props = p;
    }
}
exports.LevelChunk = LevelChunk;
LevelChunk.empty = new LevelChunk({
    chunk: new Chunk_1.Chunk(0, 0, [], [], [], [], []),
    cache: false,
    usedHashes: [],
});
