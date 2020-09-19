"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenConnectionRequestOne = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class OpenConnectionRequestOne extends Packet_1.Packet {
    constructor(p) {
        super(protocol_1.Packets.OPEN_CONNECTION_REQUEST_ONE, [
            { parser: data_1.DataType.MAGIC },
            { name: 'protocol', parser: data_1.DataType.BYTE },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeBytes(0x00, props.mtuSize);
                    }
                    else {
                        props.mtuSize = data.length - 17;
                    }
                },
            },
        ]);
        if (p)
            this.props = p;
    }
}
exports.OpenConnectionRequestOne = OpenConnectionRequestOne;
