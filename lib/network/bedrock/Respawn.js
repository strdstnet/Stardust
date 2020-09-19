"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Respawn = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class Respawn extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.RESPAWN, [
            { name: 'position', parser: data_1.DataType.VECTOR3 },
            { name: 'state', parser: data_1.DataType.BYTE },
            { name: 'entityId', parser: data_1.DataType.U_VARLONG },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.Respawn = Respawn;
