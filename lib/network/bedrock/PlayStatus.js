"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayStatus = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class PlayStatus extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.PLAY_STATUS, [
            { name: 'status', parser: data_1.DataType.INT },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.PlayStatus = PlayStatus;
