"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchedPacket = void 0;
const Packet_1 = require("../Packet");
class BatchedPacket extends Packet_1.Packet {
    constructor() {
        super(...arguments);
        this.decodeId = false;
        this.encodeId = false;
    }
}
exports.BatchedPacket = BatchedPacket;
