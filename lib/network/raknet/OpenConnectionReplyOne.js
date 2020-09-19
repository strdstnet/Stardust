"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenConnectionReplyOne = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class OpenConnectionReplyOne extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.OPEN_CONNECTION_REPLY_ONE, [
            { parser: data_1.DataType.MAGIC },
            { parser: data_1.DataType.LONG, resolve: () => protocol_1.Protocol.SERVER_ID },
            { parser: data_1.DataType.BYTE, resolve: () => 0 },
            { name: 'mtuSize', parser: data_1.DataType.SHORT },
        ]);
        if (p)
            this.props = p;
    }
}
exports.OpenConnectionReplyOne = OpenConnectionReplyOne;
