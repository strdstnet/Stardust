"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityDefinitionList = void 0;
const protocol_1 = require("../../types/protocol");
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const BedrockData_1 = require("../../data/BedrockData");
class EntityDefinitionList extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.ENTITY_DEFINITION_LIST, [
            {
                parser({ type, data, props, value }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.append(value);
                    }
                    else {
                        props.entityDefinitions = data.readRemaining();
                    }
                },
                resolve: () => BedrockData_1.BedrockData.ENTITY_DEFINITIONS,
            },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.EntityDefinitionList = EntityDefinitionList;
