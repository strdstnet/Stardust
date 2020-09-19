"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRequest = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BundledPacket_1 = require("./BundledPacket");
class ConnectionRequest extends BundledPacket_1.BundledPacket {
    constructor(p) {
        super(protocol_1.Packets.CONNECTION_REQUEST, [
            { name: 'clientId', parser: data_1.DataType.LONG },
            { name: 'sendPingTime', parser: data_1.DataType.LONG },
            { name: 'hasSecurity', parser: data_1.DataType.BOOLEAN },
        ]);
        if (p)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, p);
    }
}
exports.ConnectionRequest = ConnectionRequest;
