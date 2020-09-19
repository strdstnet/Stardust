"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = exports.ParserType = void 0;
const BinaryData_1 = require("../utils/BinaryData");
const data_1 = require("../types/data");
const logger_1 = __importDefault(require("@bwatton/logger"));
var ParserType;
(function (ParserType) {
    ParserType[ParserType["ENCODE"] = 0] = "ENCODE";
    ParserType[ParserType["DECODE"] = 1] = "DECODE";
})(ParserType = exports.ParserType || (exports.ParserType = {}));
const encodeDataType = (data, type, value, p) => {
    if (type === data_1.DataType.MAGIC) {
        return data.writeMagic();
    }
    if (typeof value === 'undefined') {
        console.log('UNDEFINED', value, p);
        return;
    }
    switch (type) {
        case data_1.DataType.BYTE:
            data.writeByte(value);
            break;
        case data_1.DataType.LONG:
            data.writeLong(value instanceof BigInt ? Number(value) : value);
            break;
        case data_1.DataType.SHORT:
            data.writeShort(value);
            break;
        case data_1.DataType.L_SHORT:
            data.writeLShort(value);
            break;
        case data_1.DataType.STRING:
            data.writeString(value, true);
            break;
        case data_1.DataType.RAW_STRING:
            data.writeShort(value.length);
            data.writeString(value, false);
            break;
        case data_1.DataType.BOOLEAN:
            data.writeBoolean(value);
            break;
        case data_1.DataType.ADDRESS:
            data.writeAddress(value);
            break;
        case data_1.DataType.L_TRIAD:
            data.writeLTriad(value);
            break;
        case data_1.DataType.INT:
            data.writeInt(value);
            break;
        case data_1.DataType.VECTOR3_VARINT:
            data.writeVector3VarInt(value);
            break;
        case data_1.DataType.VECTOR3_FLOAT:
            data.writeVector3Float(value);
            break;
        case data_1.DataType.VECTOR3:
            data.writeVector3(value);
            break;
        case data_1.DataType.VARINT:
            data.writeVarInt(value);
            break;
        case data_1.DataType.U_VARLONG:
            data.writeUnsignedVarLong(value);
            break;
        case data_1.DataType.U_VARINT:
            data.writeUnsignedVarInt(value);
            break;
        case data_1.DataType.VARLONG:
            data.writeVarLong(value);
            break;
        case data_1.DataType.L_FLOAT:
            data.writeLFloat(value);
            break;
        case data_1.DataType.L_INT:
            data.writeLInt(value);
            break;
        case data_1.DataType.L_LONG:
            data.writeLLong(value);
            break;
        case data_1.DataType.CONTAINER_ITEM:
            data.writeContainerItem(value);
            break;
        case data_1.DataType.CHUNK:
            data.writeChunk(value);
            break;
        default:
            console.error('Unknown DataType on write:', type);
    }
};
const decodeDataType = (data, type) => {
    switch (type) {
        case data_1.DataType.BYTE:
            return data.readByte();
        case data_1.DataType.LONG:
            return data.readLong();
        case data_1.DataType.MAGIC:
            return data.readMagic();
        case data_1.DataType.SHORT:
            return data.readShort();
        case data_1.DataType.SECURITY:
            return data.readSecuity();
        case data_1.DataType.BOOLEAN:
            return data.readBoolean();
        case data_1.DataType.RAW_STRING:
            return data.readString(data.readShort());
        case data_1.DataType.ADDRESS:
            return data.readAddress();
        case data_1.DataType.L_TRIAD:
            return data.readLTriad();
        case data_1.DataType.INT:
            return data.readInt();
        case data_1.DataType.STRING:
            return data.readString();
        case data_1.DataType.L_SHORT:
            return data.readLShort();
        case data_1.DataType.VARINT:
            return data.readVarInt();
        case data_1.DataType.VECTOR3:
            return data.readVector3();
        case data_1.DataType.U_VARLONG:
            return data.readUnsignedVarLong();
        case data_1.DataType.U_VARINT:
            return data.readUnsignedVarInt();
        case data_1.DataType.VARLONG:
            return data.readVarLong();
        case data_1.DataType.L_FLOAT:
            return data.readLFloat();
        case data_1.DataType.L_INT:
            return data.readLInt();
        case data_1.DataType.L_LONG:
            return data.readLLong();
        default:
            console.error('Unknown DataType on read:', type);
    }
};
class Packet {
    constructor(id, schema) {
        this.id = id;
        this.schema = schema;
        this.encodeId = true;
        this.decodeId = true;
        this.props = {};
    }
    get logger() {
        return Packet.logger;
    }
    encode(props = {}) {
        const data = new BinaryData_1.BinaryData();
        if (this.encodeId)
            data.writeByte(this.id);
        if (!this.props)
            this.props = {};
        Object.assign(this.props, props);
        this.schema.forEach(({ name, parser, resolve }) => {
            // const value = resolve ? resolve(this.props) : (name ? (this.props as any)[name] : null)
            const value = name && this.props[name] ? this.props[name] : (resolve ? resolve(this.props) : null);
            if (typeof parser === 'function') {
                parser({
                    type: ParserType.ENCODE,
                    data,
                    props: this.props,
                    value,
                    self: this,
                });
            }
            else {
                encodeDataType(data, parser, value, name);
            }
        });
        this.data = data;
        return data;
    }
    /**
     * @deprecated Use Packet.parse() instead
     */
    decode(data) {
        this.data = data;
        const props = this.props || {};
        this.id = (this.decodeId ? data.readByte() : this.id);
        this.schema.forEach(({ name, parser }) => {
            if (typeof parser === 'function') {
                parser({
                    type: ParserType.DECODE,
                    data,
                    props: props,
                    value: null,
                    self: this,
                });
            }
            else {
                const result = decodeDataType(data, parser);
                if (name)
                    props[name] = result;
            }
        });
        this.props = props;
        this.data = data.clone();
        return {
            ...props,
            id: this.id,
        };
    }
    parse(data) {
        // eslint-disable-next-line deprecation/deprecation
        this.decode(data);
        return this;
    }
}
exports.Packet = Packet;
Packet.logger = new logger_1.default('Packet');
