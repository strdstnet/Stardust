"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level = void 0;
const Chunk_1 = require("./Chunk");
const SubChunk_1 = require("./SubChunk");
const prismarine_provider_anvil_1 = __importDefault(require("prismarine-provider-anvil"));
const path_1 = __importDefault(require("path"));
const CompoundTag_1 = require("../nbt/CompoundTag");
const IntArrayTag_1 = require("../nbt/IntArrayTag");
const IntTag_1 = require("../nbt/IntTag");
const LongTag_1 = require("../nbt/LongTag");
const StringTag_1 = require("../nbt/StringTag");
const Tag_1 = require("../nbt/Tag");
const LongArrayTag_1 = require("../nbt/LongArrayTag");
const ListTag_1 = require("../nbt/ListTag");
const EndTag_1 = require("../nbt/EndTag");
const ByteTag_1 = require("../nbt/ByteTag");
const ByteArrayTag_1 = require("../nbt/ByteArrayTag");
const ShortTag_1 = require("../nbt/ShortTag");
const DoubleTag_1 = require("../nbt/DoubleTag");
const FloatTag_1 = require("../nbt/FloatTag");
const Anvil = prismarine_provider_anvil_1.default.Anvil('1.8');
const WORLDS_DIR = path_1.default.join(__dirname, '..', '..', 'worlds');
class Level {
    constructor(name, anvil) {
        this.name = name;
        this.anvil = anvil;
        this.id = ++Level.LAST_ID;
        this.chunkCache = new Map();
        this.loadChunk(0, 0);
    }
    async loadChunk(x, z) {
        const nbt = await this.anvil.loadRaw(x, z);
        const translated = this.translateNBT(nbt);
        const level = translated.get('Level');
        const subChunks = [];
        for (const section of level.val('Sections')) {
            if (section.val('Y') === -1) {
                subChunks.push(SubChunk_1.SubChunk.empty);
            }
            else {
                subChunks.push(new SubChunk_1.SubChunk(section.val('Data') || [], section.val('Blocks') || [], section.val('SkyLight') || [], section.val('BlockLight') || []));
            }
        }
        const chunk = new Chunk_1.Chunk(level.val('xPos'), level.val('zPos'), subChunks, level.val('Entities'), level.val('TileEntities'), level.val('Biomes'), level.val('HeightMap'));
        this.chunkCache.set(Level.getChunkId(x, z), chunk);
        return chunk;
    }
    translateNBT(nbt, name = nbt.name, nbtType = nbt.type) {
        let tag;
        const type = this.translateNBTType(nbtType);
        switch (type) {
            case Tag_1.TagType.Compound:
                tag = new CompoundTag_1.CompoundTag(name);
                for (const [name, child] of Object.entries(nbt.value)) {
                    tag.add(this.translateNBT(child, name));
                }
                break;
            case Tag_1.TagType.Int:
                tag = new IntTag_1.IntTag(name, nbt.value);
                break;
            case Tag_1.TagType.IntArray:
                tag = new IntArrayTag_1.IntArrayTag(name, nbt.value);
                break;
            case Tag_1.TagType.Long:
                tag = new LongTag_1.LongTag(name, nbt.value);
                break;
            case Tag_1.TagType.LongArray:
                tag = new LongArrayTag_1.LongArrayTag(name, nbt.value);
                break;
            case Tag_1.TagType.String:
                tag = new StringTag_1.StringTag(name, nbt.value);
                break;
            case Tag_1.TagType.List:
                const values = nbt.value.value.map((t) => this.translateNBT({ value: t }, t.name, nbt.value.type));
                tag = new ListTag_1.ListTag(name, this.translateNBTType(nbt.value.type), values);
                break;
            case Tag_1.TagType.End:
                tag = new EndTag_1.EndTag(name);
                break;
            case Tag_1.TagType.Byte:
                tag = new ByteTag_1.ByteTag(name, nbt.value);
                break;
            case Tag_1.TagType.ByteArray:
                tag = new ByteArrayTag_1.ByteArrayTag(name, nbt.value);
                break;
            case Tag_1.TagType.Short:
                tag = new ShortTag_1.ShortTag(name, nbt.value);
                break;
            case Tag_1.TagType.Double:
                tag = new DoubleTag_1.DoubleTag(name, nbt.value);
                break;
            case Tag_1.TagType.Float:
                tag = new FloatTag_1.FloatTag(name, nbt.value);
                break;
            default:
                throw new Error(`Unknown tag type: ${nbt.type}`);
        }
        return tag;
    }
    translateNBTType(type) {
        switch (type) {
            case 'compound':
                return Tag_1.TagType.Compound;
            case 'int':
                return Tag_1.TagType.Int;
            case 'intArray':
                return Tag_1.TagType.IntArray;
            case 'long':
                return Tag_1.TagType.Long;
            case 'longArray':
                return Tag_1.TagType.LongArray;
            case 'string':
                return Tag_1.TagType.String;
            case 'list':
                return Tag_1.TagType.List;
            case 'end':
                return Tag_1.TagType.End;
            case 'byte':
                return Tag_1.TagType.Byte;
            case 'byteArray':
                return Tag_1.TagType.ByteArray;
            case 'short':
                return Tag_1.TagType.Short;
            case 'double':
                return Tag_1.TagType.Double;
            case 'float':
                return Tag_1.TagType.Float;
            default:
                throw new Error(`Unknown tag type: ${type}`);
        }
    }
    static getChunkId(x, z) {
        return `chunk:${x}:${z}`;
    }
    static TestWorld() {
        return new Level('TestLevel', new Anvil(path_1.default.join(WORLDS_DIR, 'one_eight_yes', 'region')));
    }
    async getChunkAt(x, z) {
        const inCache = this.chunkCache.get(Level.getChunkId(x, z));
        return inCache ? inCache : await this.loadChunk(x, z);
    }
}
exports.Level = Level;
Level.LAST_ID = 0;
