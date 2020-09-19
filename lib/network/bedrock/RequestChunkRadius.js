"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestChunkRadius = void 0;
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class RequestChunkRadius extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.REQUEST_CHUNK_RADIUS, [
            { name: 'radius', parser: data_1.DataType.VARINT },
        ]);
        if (p)
            this.props = p;
    }
}
exports.RequestChunkRadius = RequestChunkRadius;
