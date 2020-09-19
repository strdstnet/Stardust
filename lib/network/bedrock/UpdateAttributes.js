"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAttributes = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const Packet_1 = require("../Packet");
const Attribute_1 = require("../../entity/Attribute");
class UpdateAttributes extends BatchedPacket_1.BatchedPacket {
    constructor(props) {
        super(protocol_1.Packets.UPDATE_ATTRIBUTES, [
            { name: 'entityRuntimeId', parser: data_1.DataType.U_VARLONG },
            {
                name: 'entries',
                parser({ type, data, props, value }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.entries = [];
                        const count = data.readUnsignedVarInt();
                        for (let i = 0; i < count; i++) {
                            const min = data.readLFloat();
                            const max = data.readLFloat();
                            const current = data.readLFloat();
                            const defaultVal = data.readLFloat();
                            const name = data.readString();
                            const attr = Attribute_1.Attribute.getByName(name);
                            if (attr) {
                                attr.minVal = min;
                                attr.maxVal = max;
                                attr.value = current;
                                attr.defaultVal = defaultVal;
                                props.entries.push(attr);
                            }
                            else {
                                Packet_1.Packet.logger.error(`Unknown attribute: ${name}`);
                            }
                        }
                    }
                    else {
                        data.writeUnsignedVarInt(value.length);
                        for (const attr of value) {
                            data.writeLFloat(attr.minVal);
                            data.writeLFloat(attr.maxVal);
                            data.writeLFloat(attr.value);
                            data.writeLFloat(attr.defaultVal);
                            data.writeString(attr.name);
                        }
                    }
                },
                resolve: () => [],
            },
        ]);
        if (props)
            this.props = Object.assign({}, props);
    }
}
exports.UpdateAttributes = UpdateAttributes;
