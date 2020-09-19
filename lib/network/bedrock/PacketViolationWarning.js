"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketViolationWarning = void 0;
const data_1 = require("../../types/data");
const protocol_1 = require("../../types/protocol");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class PacketViolationWarning extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.PACKET_VIOLATION_WARNING, [
            { name: 'type', parser: data_1.DataType.VARINT },
            { name: 'severity', parser: data_1.DataType.VARINT },
            { name: 'packetId', parser: data_1.DataType.VARINT },
            { name: 'message', parser: data_1.DataType.STRING },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.PacketViolationWarning = PacketViolationWarning;
