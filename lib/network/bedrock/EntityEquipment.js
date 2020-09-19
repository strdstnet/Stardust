"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityEquipment = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class EntityEquipment extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.ENTITY_DEFINITION_LIST, [
            { name: 'entityRuntimeId', parser: data_1.DataType.U_VARLONG },
            { name: 'item', parser: data_1.DataType.CONTAINER_ITEM },
            { name: 'inventorySlot', parser: data_1.DataType.BYTE },
            { name: 'hotbarSlot', parser: data_1.DataType.BYTE },
            { name: 'containerId', parser: data_1.DataType.BYTE },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.EntityEquipment = EntityEquipment;
