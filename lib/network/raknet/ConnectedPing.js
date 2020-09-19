"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedPing = void 0;
const BundledPacket_1 = require("./BundledPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class ConnectedPing extends BundledPacket_1.BundledPacket {
    constructor(p) {
        super(protocol_1.Packets.CONNECTED_PING, [
            { name: 'time', parser: data_1.DataType.LONG },
        ]);
        if (p)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, p);
    }
}
exports.ConnectedPing = ConnectedPing;
