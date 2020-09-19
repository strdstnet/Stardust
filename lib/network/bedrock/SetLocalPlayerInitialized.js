"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetLocalPlayerInitialized = void 0;
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class SetLocalPlayerInitialized extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.SET_LOCAL_PLAYER_INITIALIZED, [
            { name: 'entityRuntimeId', parser: data_1.DataType.U_VARLONG },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.SetLocalPlayerInitialized = SetLocalPlayerInitialized;
