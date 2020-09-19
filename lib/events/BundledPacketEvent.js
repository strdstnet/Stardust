"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundledPacketEvent = void 0;
const PacketEvent_1 = require("./PacketEvent");
class BundledPacketEvent extends PacketEvent_1.PacketEvent {
    get bundleIndex() {
        return this.args[2][0];
    }
    get bundleEvent() {
        return this.args[2][1];
    }
    remove() {
        this.bundleEvent.removePacket(this.bundleIndex);
    }
}
exports.BundledPacketEvent = BundledPacketEvent;
