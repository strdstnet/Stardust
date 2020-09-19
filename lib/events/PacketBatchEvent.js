"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketBatchEvent = void 0;
const PacketEvent_1 = require("./PacketEvent");
class PacketBatchEvent extends PacketEvent_1.PacketEvent {
    constructor(packetId, packet, packets) {
        super(packetId, packet, [packets]);
        this.indexedPackets = {};
        for (const [idx, packet] of packets.entries()) {
            this.indexedPackets[idx] = packet;
        }
    }
    get packets() {
        return Object.values(this.indexedPackets);
    }
    removePacket(index) {
        delete this.indexedPackets[index];
    }
}
exports.PacketBatchEvent = PacketBatchEvent;
