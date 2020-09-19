"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACK = void 0;
const Acknowledgement_1 = require("./Acknowledgement");
const protocol_1 = require("../../types/protocol");
class ACK extends Acknowledgement_1.Acknowledgement {
    constructor(sequences) {
        super(protocol_1.Packets.ACK, sequences);
    }
}
exports.ACK = ACK;
