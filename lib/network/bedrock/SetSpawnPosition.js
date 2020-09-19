"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSpawnPosition = void 0;
const BundledPacket_1 = require("../raknet/BundledPacket");
const protocol_1 = require("../../types/protocol");
class SetSpawnPosition extends BundledPacket_1.BundledPacket {
    constructor() {
        super(protocol_1.Packets.SET_SPAWN_POSITION, []);
    }
}
exports.SetSpawnPosition = SetSpawnPosition;
