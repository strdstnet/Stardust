"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchedPacketEvent = void 0;
const PacketEvent_1 = require("./PacketEvent");
class BatchedPacketEvent extends PacketEvent_1.PacketEvent {
    get batchIndex() {
        return this.args[2][0];
    }
    get batchEvent() {
        return this.args[2][1];
    }
    remove() {
        this.batchEvent.removePacket(this.batchIndex);
    }
}
exports.BatchedPacketEvent = BatchedPacketEvent;
