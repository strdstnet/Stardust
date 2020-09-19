"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenConnectionReplyTwo = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class OpenConnectionReplyTwo extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.OPEN_CONNECTION_REPLY_TWO, [
            { parser: data_1.DataType.MAGIC },
            { parser: data_1.DataType.LONG, resolve: () => protocol_1.Protocol.SERVER_ID },
            { name: 'address', parser: data_1.DataType.ADDRESS },
            { name: 'mtuSize', parser: data_1.DataType.SHORT },
            { parser: data_1.DataType.BYTE, resolve: () => 0 },
        ]);
        if (p)
            this.props = p;
    }
}
exports.OpenConnectionReplyTwo = OpenConnectionReplyTwo;
