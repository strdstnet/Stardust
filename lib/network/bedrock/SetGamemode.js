"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetGamemode = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class SetGamemode extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.SET_GAMEMODE, [
            { name: 'mode', parser: data_1.DataType.VARINT },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.SetGamemode = SetGamemode;
