"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetTime = void 0;
const BundledPacket_1 = require("../raknet/BundledPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class SetTime extends BatchedPacket_1.BatchedPacket {
    constructor(props) {
        super(protocol_1.Packets.SET_TIME, [
            { name: 'time', parser: data_1.DataType.VARINT },
        ]);
        if (props)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, props);
    }
}
exports.SetTime = SetTime;
