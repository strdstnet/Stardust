"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketBundleEvent = void 0;
const PacketEvent_1 = require("./PacketEvent");
class PacketBundleEvent extends PacketEvent_1.PacketEvent {
    constructor(packetId, packet, sequenceNumber, packets) {
        super(packetId, packet, [sequenceNumber, packets]);
        this.indexedPackets = {};
        for (const [idx, packet] of packets.entries()) {
            this.indexedPackets[idx] = packet;
        }
    }
    get sequenceNumber() {
        return this.args[2][0];
    }
    get packets() {
        return Object.values(this.indexedPackets);
    }
    removePacket(index) {
        delete this.indexedPackets[index];
    }
}
exports.PacketBundleEvent = PacketBundleEvent;
