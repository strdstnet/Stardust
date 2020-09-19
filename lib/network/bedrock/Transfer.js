"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class Transfer extends BatchedPacket_1.BatchedPacket {
    constructor(props) {
        super(protocol_1.Packets.TRANSFER, [
            { name: 'address', parser: data_1.DataType.STRING },
            { name: 'port', parser: data_1.DataType.L_SHORT },
        ]);
        if (props)
            this.props = Object.assign({}, props);
    }
}
exports.Transfer = Transfer;
