"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkChunkPublisher = void 0;
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class NetworkChunkPublisher extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.NETWORK_CHUNK_PUBLISHER, [
            { name: 'x', parser: data_1.DataType.VARINT },
            { name: 'y', parser: data_1.DataType.VARINT },
            { name: 'z', parser: data_1.DataType.VARINT },
            { name: 'radius', parser: data_1.DataType.U_VARINT },
        ]);
        if (p)
            this.props = p;
    }
}
exports.NetworkChunkPublisher = NetworkChunkPublisher;
