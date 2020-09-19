"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenConnectionRequestTwo = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class OpenConnectionRequestTwo extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.OPEN_CONNECTION_REQUEST_TWO, [
            { parser: data_1.DataType.MAGIC },
            { name: 'address', parser: data_1.DataType.ADDRESS },
            { name: 'mtuSize', parser: data_1.DataType.SHORT },
            { name: 'clientId', parser: data_1.DataType.LONG },
        ]);
        if (p)
            this.props = p;
    }
}
exports.OpenConnectionRequestTwo = OpenConnectionRequestTwo;
