"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNotification = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const Packet_1 = require("../Packet");
class EntityNotification extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.ENTITY_NOTIFICATION, [
            { name: 'entityRuntimeId', parser: data_1.DataType.U_VARLONG },
            {
                // TODO: Implement metadata
                name: 'metadata',
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeUnsignedVarInt(props.metadata.length);
                    }
                    else {
                        props.metadata = new Array(data.readUnsignedVarInt());
                    }
                },
            },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.EntityNotification = EntityNotification;
