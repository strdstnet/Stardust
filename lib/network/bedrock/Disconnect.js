"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disconnect = void 0;
const BundledPacket_1 = require("../raknet/BundledPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class Disconnect extends BundledPacket_1.BundledPacket {
    constructor(props) {
        super(protocol_1.Packets.DISCONNECT, [
            { name: 'hideScreen', parser: data_1.DataType.BOOLEAN },
            { name: 'message', parser: data_1.DataType.STRING },
        ]);
        if (props)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, props);
    }
}
exports.Disconnect = Disconnect;
