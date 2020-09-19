"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerNotification = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const Packet_1 = require("../Packet");
class ContainerNotification extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.CONTAINER_NOTIFICATION, [
            { name: 'type', parser: data_1.DataType.U_VARINT },
            {
                name: 'items',
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeUnsignedVarInt(props.items.length);
                        for (const item of props.items) {
                            data.writeContainerItem(item);
                        }
                    }
                    else {
                        // TODO: DECODE
                    }
                },
            },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.ContainerNotification = ContainerNotification;
