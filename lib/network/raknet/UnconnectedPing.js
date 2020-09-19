"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnconnectedPing = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class UnconnectedPing extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.UNCONNECTED_PING, [
            { name: 'pingId', parser: data_1.DataType.LONG },
            { name: 'magic', parser: data_1.DataType.MAGIC },
            { name: 'clientId', parser: data_1.DataType.LONG },
        ]);
        if (p)
            this.props = p;
    }
}
exports.UnconnectedPing = UnconnectedPing;
