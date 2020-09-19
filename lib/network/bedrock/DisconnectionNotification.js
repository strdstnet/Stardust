"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectionNotification = void 0;
const BundledPacket_1 = require("../raknet/BundledPacket");
const protocol_1 = require("../../types/protocol");
class DisconnectionNotification extends BundledPacket_1.BundledPacket {
    constructor() {
        super(protocol_1.Packets.DISCONNECTION_NOTIFICATION, []);
    }
}
exports.DisconnectionNotification = DisconnectionNotification;
