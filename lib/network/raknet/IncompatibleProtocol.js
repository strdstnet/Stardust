"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncompatibleProtocol = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class IncompatibleProtocol extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.INCOMPATIBLE_PROTOCOL, [
            { name: 'protocol', parser: data_1.DataType.BYTE, resolve: () => protocol_1.Protocol.PROTOCOL_VERSION },
            { name: 'magic', parser: data_1.DataType.MAGIC },
            { name: 'serverId', parser: data_1.DataType.LONG, resolve: () => protocol_1.Protocol.SERVER_ID },
        ]);
        if (p)
            this.props = p;
    }
}
exports.IncompatibleProtocol = IncompatibleProtocol;
