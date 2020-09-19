"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketEvent = void 0;
const Event_1 = require("./Event");
class PacketEvent extends Event_1.Event {
    constructor(packetId, packet, extra = []) {
        super(packetId, packet, extra);
        this.proxy = true;
    }
    get packetId() {
        return this.args[0];
    }
    get packet() {
        return this.args[1];
    }
    get shouldProxy() {
        return this.proxy;
    }
    setProxy(proxy) {
        this.proxy = proxy;
    }
}
exports.PacketEvent = PacketEvent;
