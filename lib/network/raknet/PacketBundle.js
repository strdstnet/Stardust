"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketBundle = void 0;
const Packet_1 = require("../Packet");
const data_1 = require("../../types/data");
const BinaryData_1 = require("../../utils/BinaryData");
const parseBundledPackets_1 = require("../../utils/parseBundledPackets");
class PacketBundle extends Packet_1.Packet {
    constructor(p, flags = BinaryData_1.BitFlag.Valid) {
        // if(p) {
        //   console.log('sending:', p.sequenceNumber)
        // }
        super(flags, [
            { name: 'sequenceNumber', parser: data_1.DataType.L_TRIAD },
            {
                parser({ type, props, data }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.packets = parseBundledPackets_1.parseBundledPackets(data);
                    }
                    else {
                        for (const packet of props.packets) {
                            data.append(parseBundledPackets_1.encodeBundledPacket(packet).buf);
                        }
                    }
                },
            },
        ]);
        if (p)
            this.props = p;
    }
    decode(data) {
        super.decode(data);
        return {
            ...(this.props),
            id: this.id,
            flags: this.id,
        };
    }
}
exports.PacketBundle = PacketBundle;
