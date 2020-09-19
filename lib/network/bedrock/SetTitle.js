"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetTitle = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class SetTitle extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.SET_TITLE, [
            { name: 'command', parser: data_1.DataType.VARINT },
            { name: 'text', parser: data_1.DataType.STRING, resolve: props => props.text || '' },
            { name: 'fadeInTime', parser: data_1.DataType.VARINT, resolve: props => props.fadeInTime || 0 },
            { name: 'stayTime', parser: data_1.DataType.VARINT, resolve: props => props.stayTime || 0 },
            { name: 'fadeOutTime', parser: data_1.DataType.VARINT, resolve: props => props.fadeOutTime || 0 },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.SetTitle = SetTitle;
