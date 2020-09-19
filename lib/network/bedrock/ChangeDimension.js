"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeDimension = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class ChangeDimension extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.CHANGE_DIMENSION, [
            { name: 'dimension', parser: data_1.DataType.VARINT },
            { name: 'position', parser: data_1.DataType.VECTOR3 },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeBoolean(props.respawn || false);
                    }
                    else {
                        props.respawn = data.readBoolean();
                    }
                },
            },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.ChangeDimension = ChangeDimension;
