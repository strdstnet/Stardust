"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAK = void 0;
const Acknowledgement_1 = require("./Acknowledgement");
const protocol_1 = require("../../types/protocol");
class NAK extends Acknowledgement_1.Acknowledgement {
    constructor(sequences) {
        super(protocol_1.Packets.NAK, sequences);
    }
}
exports.NAK = NAK;
