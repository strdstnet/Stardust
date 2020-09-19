"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID = void 0;
const uuid_1 = require("uuid");
const BinaryData_1 = require("./BinaryData");
class UUID {
    constructor(uuid) {
        this.uuid = uuid;
        this.data = new BinaryData_1.BinaryData(Buffer.from(uuid.replace(/-/g, ''), 'hex'));
        this.parts = [
            this.data.readInt(),
            this.data.readInt(),
            this.data.readInt(),
            this.data.readInt(),
        ];
    }
    static random() {
        return new UUID(uuid_1.v4());
    }
    toString() {
        return this.uuid;
    }
}
exports.UUID = UUID;
