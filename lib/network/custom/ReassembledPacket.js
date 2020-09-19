"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReassembledPacket = void 0;
const BundledPacket_1 = require("../raknet/BundledPacket");
class ReassembledPacket extends BundledPacket_1.BundledPacket {
    constructor(parts, flags) {
        super(flags, []);
        this.parts = parts;
    }
}
exports.ReassembledPacket = ReassembledPacket;
