"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryData = exports.BitFlag = exports.DataLengths = void 0;
const zlib_1 = __importDefault(require("zlib"));
const logger_1 = __importDefault(require("@bwatton/logger"));
const math3d_1 = require("math3d");
const protocol_1 = require("../types/protocol");
const network_1 = require("../types/network");
const world_1 = require("../types/world");
const UUID_1 = require("./UUID");
const SubChunk_1 = require("../level/SubChunk");
var DataLengths;
(function (DataLengths) {
    DataLengths[DataLengths["BYTE"] = 1] = "BYTE";
    DataLengths[DataLengths["SHORT"] = 2] = "SHORT";
    DataLengths[DataLengths["L_SHORT"] = 2] = "L_SHORT";
    DataLengths[DataLengths["SECURITY"] = 2] = "SECURITY";
    DataLengths[DataLengths["L_TRIAD"] = 3] = "L_TRIAD";
    DataLengths[DataLengths["INT"] = 4] = "INT";
    DataLengths[DataLengths["L_INT"] = 4] = "L_INT";
    DataLengths[DataLengths["LONG"] = 8] = "LONG";
    DataLengths[DataLengths["MAGIC"] = 16] = "MAGIC";
    DataLengths[DataLengths["FLOAT"] = 4] = "FLOAT";
})(DataLengths = exports.DataLengths || (exports.DataLengths = {}));
var BitFlag;
(function (BitFlag) {
    BitFlag[BitFlag["Valid"] = 128] = "Valid";
    BitFlag[BitFlag["ACK"] = 64] = "ACK";
    BitFlag[BitFlag["NAK"] = 32] = "NAK";
    BitFlag[BitFlag["PacketPair"] = 16] = "PacketPair";
    BitFlag[BitFlag["ContinuousSend"] = 8] = "ContinuousSend";
    BitFlag[BitFlag["NeedsBAndS"] = 4] = "NeedsBAndS";
})(BitFlag = exports.BitFlag || (exports.BitFlag = {}));
// TODO: Make singleton?
class BinaryData {
    constructor(data) {
        this.pos = 0; // BYTES
        this.logger = new logger_1.default('BinaryData');
        this.buf = Buffer.from(data ? data : [0]);
    }
    toBuffer() {
        const buf = Buffer.alloc(this.buf.length);
        this.buf.copy(buf, 0);
        return buf;
    }
    clone() {
        return new BinaryData(this.toBuffer());
    }
    get length() {
        return this.buf.length;
    }
    // Unused allocated space
    get space() {
        return this.buf.length - this.pos;
    }
    get feof() {
        return this.space < 1;
    }
    ensureLength(length, filler = '\x00') {
        if (this.length === length)
            return this;
        if (this.length > length) {
            this.buf = this.buf.slice(0, length);
        }
        else {
            this.writeString(filler.repeat(this.length - length), false, false);
        }
        return this;
    }
    extract(offset = this.pos, length = this.buf.length) {
        const buf = new Uint8Array(length - offset);
        for (let i = 0; i <= length; i++) {
            buf[i] = this.buf[offset + i];
        }
        return new BinaryData(buf);
    }
    readRemaining() {
        const buf = this.buf.slice(this.pos);
        this.pos = this.buf.length;
        return buf;
    }
    static inflate(buffer) {
        const buf = zlib_1.default.inflateRawSync(buffer, {
            chunkSize: 1024 * 1024 * 2,
        });
        return new BinaryData(buf);
    }
    static deflate(buffer) {
        const buf = zlib_1.default.deflateRawSync(buffer, {
            chunkSize: 1024 * 1024 * 2,
        });
        return new BinaryData(buf);
    }
    alloc(bytes) {
        if (this.space < bytes) {
            this.buf = Buffer.concat([
                this.buf,
                Buffer.alloc(bytes - this.space),
            ]);
        }
    }
    append(input, offset = 0, skip = true) {
        if (input instanceof BinaryData) {
            input = input.toBuffer();
        }
        this.alloc(input.length);
        const buf = Buffer.from(input, offset);
        buf.copy(this.buf, this.pos);
        if (skip)
            this.pos += input.length;
    }
    appendWithLength(input) {
        this.writeUnsignedVarInt(input.length);
        this.append(input);
    }
    /**
     * @description Splits the buffer into buffers each of no more than [mtu] size
     * @param mtu Number of bytes to split by
     */
    split(mtu) {
        this.pos = 0;
        const count = Math.ceil(this.length / mtu);
        const parts = [];
        for (let i = 1; i <= count; i++) {
            const data = this.read(i < count ? mtu : (this.length - this.pos));
            parts.push(new BinaryData(data));
        }
        return parts;
    }
    writeByte(val) {
        this.alloc(DataLengths.BYTE);
        this.buf[this.pos] = val;
        this.pos++;
    }
    writeBytes(val, count) {
        this.alloc(DataLengths.BYTE * count);
        for (let i = 0; i < count; i++) {
            this.buf[this.pos] = val;
            this.pos++;
        }
    }
    readByte(skip = true) {
        const byte = this.buf[this.pos];
        if (skip)
            this.pos++;
        return byte;
    }
    writeLong(val) {
        this.alloc(DataLengths.LONG);
        this.buf.writeBigInt64BE(val, this.pos);
        this.pos += DataLengths.LONG;
    }
    readLong(skip = true) {
        const val = this.buf.readBigInt64BE(this.pos);
        if (skip)
            this.pos += DataLengths.LONG;
        return val;
    }
    writeLLong(val) {
        this.alloc(DataLengths.LONG);
        this.buf.writeBigInt64LE(val, this.pos);
        this.pos += DataLengths.LONG;
    }
    readLLong(skip = true) {
        const val = this.buf.readBigInt64LE(this.pos);
        if (skip)
            this.pos += DataLengths.LONG;
        return val;
    }
    writeMagic() {
        const buf = Buffer.from(protocol_1.Protocol.MAGIC, 'binary');
        this.append(buf);
    }
    readMagic() {
        const buf = this.buf.slice(this.pos, this.pos + 16);
        this.pos += DataLengths.MAGIC;
        return buf.toString('binary');
    }
    writeShort(val) {
        this.alloc(DataLengths.SHORT);
        this.buf.writeUInt16BE(val, this.pos);
        this.pos += DataLengths.SHORT;
    }
    readShort(skip = true) {
        const val = this.buf.readUInt16BE(this.pos);
        if (skip)
            this.pos += DataLengths.SHORT;
        return val;
    }
    writeUnsignedVarInt(val) {
        for (let i = 0; i < 5; i++) {
            if ((val >> 7) !== 0) {
                this.writeByte(val | 0x80);
            }
            else {
                this.writeByte(val & 0x7f);
                break;
            }
            val >>= 7;
        }
    }
    readUnsignedVarInt(skip = true) {
        let value = 0;
        for (let i = 0; i <= 28; i += 7) {
            const b = this.readByte(skip);
            value |= ((b & 0x7f) << i);
            if ((b & 0x80) === 0) {
                return value;
            }
        }
        return 0;
    }
    readUnsignedVarLong(skip = true) {
        let value = 0;
        for (let i = 0; i <= 63; i += 7) {
            const b = this.readByte(skip);
            value |= ((b & 0x7f) << i);
            if ((b & 0x80) === 0) {
                return BigInt(value);
            }
        }
        return 0n;
    }
    writeUnsignedVarLong(v) {
        let val = Number(v);
        for (let i = 0; i < 10; i++) {
            if ((val >> 7) !== 0) {
                this.writeByte(val | 0x80);
            }
            else {
                this.writeByte(val & 0x7f);
                break;
            }
            val >>= 7;
        }
    }
    read(len, skip = true) {
        const buf = this.buf.slice(this.pos, this.pos + len);
        if (skip)
            this.pos += len;
        return buf;
    }
    readString(len = this.readUnsignedVarInt(), skip = true) {
        return this.read(len, skip).toString('utf8');
    }
    writeString(val, writeLength = true, skip = true) {
        if (writeLength)
            this.writeUnsignedVarInt(val.length);
        this.append(Buffer.from(val, 'utf8'), 0, skip);
    }
    readSecuity() {
        this.pos += DataLengths.SECURITY;
    }
    readBoolean() {
        return this.readByte() !== 0x00;
    }
    writeBoolean(v) {
        this.writeByte(v === true ? 1 : 0);
    }
    readLShort(skip = true) {
        const val = this.buf.readUInt16LE(this.pos);
        if (skip)
            this.pos += DataLengths.L_SHORT;
        return val;
    }
    writeLShort(val, skip = true) {
        this.alloc(DataLengths.L_SHORT);
        this.buf.writeUInt16LE(val, this.pos);
        if (skip)
            this.pos += DataLengths.L_SHORT;
    }
    writeSignedLShort(val, skip = true) {
        this.alloc(DataLengths.L_SHORT);
        this.buf.writeInt16LE(val, this.pos);
        if (skip)
            this.pos += DataLengths.L_SHORT;
    }
    readSignedLShort(skip = true) {
        const val = this.buf.readInt16LE(this.pos);
        if (skip)
            this.pos += DataLengths.L_SHORT;
        return val;
    }
    readByteArray(length = this.readUnsignedVarInt(), skip = true) {
        return new BinaryData(this.read(length, skip));
    }
    writeByteArray(data, writeLength = true) {
        if (writeLength)
            this.writeUnsignedVarInt(data.length);
        this.append(data.buf);
    }
    readLInt(skip = true) {
        const val = this.buf.readInt32LE(this.pos);
        if (skip)
            this.pos += DataLengths.L_INT;
        return val;
    }
    writeLInt(val, skip = true) {
        this.alloc(DataLengths.L_INT);
        this.buf.writeInt32LE(val, this.pos);
        if (skip)
            this.pos += DataLengths.L_INT;
    }
    readAddress() {
        let ip, port;
        const family = this.readByte();
        switch (family) {
            case network_1.AddressFamily.IPV4:
                ip = [];
                for (let i = 0; i < 4; i++) {
                    ip.push(~this.readByte() & 0xff);
                }
                ip = ip.join('.');
                port = this.readShort();
                break;
            case network_1.AddressFamily.IPV6:
                this.readLShort();
                port = this.readShort();
                this.readInt();
                ip = this.readIPv6IP();
                this.readInt();
                break;
            default:
                throw new Error(`Unsupported family ${family}`);
        }
        return {
            ip,
            port,
            family,
        };
    }
    readIPv6IP() {
        const parts = [];
        for (let i = 0; i < 16; i++) {
            parts.push(this.readByte().toString(16));
        }
        let m = '';
        return parts.join(':').replace(/((^|:)0(?=:|$))+:?/g, t => {
            m = (t.length > m.length) ? t : m;
            return t;
        }).replace(m || ' ', '::');
    }
    writeAddress({ ip, port, family }) {
        this.writeByte(family);
        switch (family) {
            case network_1.AddressFamily.IPV4:
                ip.split('.', 4).forEach(b => this.writeByte(~parseInt(b, 10) & 0xff));
                this.writeShort(port);
                break;
            case network_1.AddressFamily.IPV6:
                this.logger.error('IPV6 writing is not yet supported');
                break;
            default:
                this.logger.error('ERR -> Unknown address family:', family);
        }
        return this;
    }
    readLTriad() {
        const triad = this.buf.readUIntLE(this.pos, DataLengths.L_TRIAD);
        this.pos += DataLengths.L_TRIAD;
        return triad;
    }
    writeLTriad(v) {
        this.alloc(DataLengths.L_TRIAD);
        this.buf.writeUIntLE(v, this.pos, DataLengths.L_TRIAD);
        this.pos += DataLengths.L_TRIAD;
    }
    readInt() {
        const int = this.buf.readInt32BE(this.pos);
        this.pos += DataLengths.INT;
        return int;
    }
    readIntLE() {
        const int = this.buf.readInt32LE(this.pos);
        this.pos += DataLengths.INT;
        return int;
    }
    writeInt(v) {
        this.alloc(DataLengths.INT);
        this.buf.writeInt32BE(v, this.pos);
        this.pos += DataLengths.INT;
    }
    writeFloat(v) {
        this.alloc(DataLengths.FLOAT);
        this.buf.writeFloatBE(v, this.pos);
        this.pos += DataLengths.FLOAT;
    }
    writeLFloat(v) {
        this.alloc(DataLengths.FLOAT);
        this.buf.writeFloatLE(v, this.pos);
        this.pos += DataLengths.FLOAT;
    }
    readLFloat(skip = true) {
        const float = this.buf.readFloatLE(this.pos);
        if (skip)
            this.pos += DataLengths.FLOAT;
        return float;
    }
    writeVarInt(v) {
        v <<= 32 >> 32;
        this.writeUnsignedVarInt((v << 1) ^ (v >> 31));
    }
    readVarInt(skip = true) {
        const raw = this.readUnsignedVarInt(skip);
        const tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return tmp ^ (raw & (1 << 63));
    }
    writeVector3Float(v3) {
        this.writeFloat(v3.x);
        this.writeFloat(v3.y);
        this.writeFloat(v3.z);
    }
    writeVector3(v3) {
        this.writeLFloat(v3.y);
        this.writeLFloat(v3.z);
        this.writeLFloat(v3.x);
    }
    readVector3(skip = true) {
        return new math3d_1.Vector3(this.readLFloat(skip), this.readLFloat(skip), this.readLFloat(skip));
    }
    writeVector3VarInt(v3) {
        this.writeVarInt(v3.x);
        this.writeVarInt(v3.y);
        this.writeVarInt(v3.z);
    }
    readVarLong(skip = true) {
        const raw = Number(this.readUnsignedVarLong(skip));
        const tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return BigInt(tmp ^ (raw & -2147483648));
    }
    writeVarLong(v) {
        const val = Number(v);
        this.writeUnsignedVarLong(BigInt((val << 1) ^ (val >> 63)));
    }
    writeContainerItem(item) {
        this.writeBoolean(!!item.count && item.id !== world_1.Items.AIR);
        this.writeVarInt(item.id);
        if (item.id === world_1.Items.AIR)
            return;
        const auxValue = ((item.damage & 0x7fff) << 8) | item.count;
        this.writeVarInt(auxValue);
        if (item.nbt) {
            // TODO: Compound tags
            // https://github.com/pmmp/PocketMine-MP/blob/f9c2ed620008a695bef2c4d141c0d26880e77040/src/pocketmine/network/mcpe/NetworkBinaryStream.php#L259
        }
        else {
            this.writeLShort(0);
        }
        this.writeVarInt(0); // CanPlaceOn
        this.writeVarInt(0); // CanDestroy
        if (item.id === world_1.Items.SHIELD) {
            this.writeVarInt(0); // some shit
        }
    }
    writeUUID(uuid) {
        this.writeLInt(uuid.parts[1]);
        this.writeLInt(uuid.parts[0]);
        this.writeLInt(uuid.parts[3]);
        this.writeLInt(uuid.parts[2]);
    }
    writeSkinImage(image) {
        this.writeLInt(image.width);
        this.writeLInt(image.height);
        // this.writeString(image.data)
        this.appendWithLength(image.data);
    }
    writeSkin(skin) {
        this.writeString(skin.id);
        // this.writeString(skin.resourcePatch)
        this.appendWithLength(skin.resourcePatch);
        this.writeSkinImage(skin.image);
        this.writeLInt(skin.animations.length);
        for (const animation of skin.animations) {
            this.writeSkinImage(animation.image);
            this.writeLInt(animation.type);
            this.writeLFloat(animation.frames);
        }
        this.writeSkinImage(skin.cape.image);
        // this.writeString(skin.geometryData)
        this.appendWithLength(skin.geometryData);
        // this.writeString(skin.animationData)
        this.appendWithLength(skin.animationData);
        this.writeBoolean(skin.premium);
        this.writeBoolean(skin.persona);
        this.writeBoolean(skin.personaCapeOnClassic);
        this.writeString(skin.cape.id);
        this.writeString(UUID_1.UUID.random().toString());
        this.writeString(skin.armSize);
        this.writeString(skin.color);
        this.writeLInt(skin.personaPieces.length);
        for (const piece of skin.personaPieces) {
            this.writeString(piece.id);
            this.writeString(piece.type);
            this.writeString(piece.packId);
            this.writeBoolean(piece.defaultPiece);
            this.writeString(piece.productId);
        }
        this.writeLInt(skin.personaPieceTints.length);
        for (const tint of skin.personaPieceTints) {
            this.writeString(tint.type);
            this.writeLInt(tint.colors.length);
            for (const color of tint.colors) {
                this.writeString(color);
            }
        }
    }
    writeChunk(chunk) {
        const nonEmptyCount = chunk.highestNonEmptySubChunk() + 1;
        for (let y = 0; y < nonEmptyCount; y++) {
            const subChunk = chunk.subChunks[y];
            this.writeByte(0); // Anvil version
            this.append(new Uint8Array(subChunk.blockData));
            this.append(new Uint8Array(subChunk.data));
        }
        this.append(new Uint8Array(chunk.biomeData));
        this.writeByte(0);
        // TODO: Tiles
        // https://github.com/pmmp/PocketMine-MP/blob/9d0ac297bbeb4b9a4330685b24c4045f7fb0c5e9/src/pocketmine/level/format/Chunk.php#L848-L848
    }
    readChunkData(chunk, numSubChunks) {
        for (let y = 0; y < numSubChunks; y++) {
            const version = this.readByte();
            if (version === 0) {
                const blockData = this.read(4096);
                const data = this.read(2048);
                chunk.subChunks.push(new SubChunk_1.SubChunk(Array.from(data), Array.from(blockData), [], []));
            }
            else {
                throw new Error(`Unsupported Anvil version: ${version}`);
            }
        }
        chunk.biomeData = Array.from(this.read(256));
        this.readByte(); // no idea what this is
    }
}
exports.BinaryData = BinaryData;
