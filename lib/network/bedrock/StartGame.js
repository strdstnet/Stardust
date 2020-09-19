"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartGame = void 0;
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const math3d_1 = require("math3d");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const world_1 = require("../../types/world");
const network_1 = require("../../types/network");
const Packet_1 = require("../Packet");
const legacy_id_map_json_1 = __importDefault(require("../../data/legacy_id_map.json"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const def = (val) => () => val;
class StartGame extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.START_GAME, [
            { name: 'entityUniqueId', parser: data_1.DataType.VARLONG },
            { name: 'entityRuntimeId', parser: data_1.DataType.U_VARLONG },
            { name: 'playerGamemode', parser: data_1.DataType.VARINT, resolve: def(world_1.Gamemode.SURVIVAL) },
            {
                name: 'playerPosition',
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        const v3 = data.readVector3();
                        props.playerPosition = new data_1.PlayerPosition(v3.x, v3.y, v3.z, data.readLFloat(), data.readLFloat());
                    }
                    else {
                        const pos = props.playerPosition;
                        data.writeVector3(pos.location);
                        data.writeLFloat(pos.pitch);
                        data.writeLFloat(pos.yaw);
                    }
                },
            },
            { name: 'seed', parser: data_1.DataType.VARINT, resolve: def(0) },
            { name: 'biomeType', parser: data_1.DataType.L_SHORT, resolve: def(0) },
            { name: 'biomeName', parser: data_1.DataType.STRING, resolve: def('') },
            { name: 'dimension', parser: data_1.DataType.VARINT, resolve: def(world_1.Dimension.OVERWOLD) },
            { name: 'generator', parser: data_1.DataType.VARINT, resolve: def(world_1.GeneratorType.OVERWORLD) },
            { name: 'worldGamemode', parser: data_1.DataType.VARINT, resolve: def(world_1.Gamemode.SURVIVAL) },
            { name: 'difficulty', parser: data_1.DataType.VARINT, resolve: def(world_1.Difficulty.PEACEFUL) },
            {
                name: 'spawnLocation',
                parser({ type, data, props, value }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.spawnLocation = new math3d_1.Vector3(data.readVarInt(), data.readUnsignedVarInt(), data.readVarInt());
                    }
                    else {
                        data.writeVarInt(value.x);
                        data.writeUnsignedVarInt(value.y);
                        data.writeVarInt(value.z);
                    }
                },
                resolve: def(new math3d_1.Vector3(0, 0, 0)),
            },
            { name: 'achievementsDisabled', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            { name: 'time', parser: data_1.DataType.VARINT, resolve: def(0) },
            { name: 'eduEditionOffer', parser: data_1.DataType.VARINT, resolve: def(0) },
            { name: 'eduFeaturesEnabled', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'eduProductUUID', parser: data_1.DataType.STRING, resolve: def('') },
            { name: 'rainLevel', parser: data_1.DataType.L_FLOAT, resolve: def(0) },
            { name: 'lightningLevel', parser: data_1.DataType.L_FLOAT, resolve: def(0) },
            { name: 'hasConfirmedPlatformLockedContent', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'isMultiplayerGame', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            { name: 'hasLANBroadcast', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            { name: 'xboxLiveBroadcastMode', parser: data_1.DataType.VARINT, resolve: def(network_1.MultiplayerVisibility.PUBLIC) },
            { name: 'platformBroadcastMode', parser: data_1.DataType.VARINT, resolve: def(network_1.MultiplayerVisibility.PUBLIC) },
            { name: 'commandsEnabled', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            { name: 'texturePacksRequired', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            {
                name: 'gameRules',
                parser({ type, data, props, value }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.gameRules = [];
                        const count = data.readUnsignedVarInt();
                        for (let i = 0; i < count; i++) {
                            const name = data.readString();
                            const type = data.readUnsignedVarInt();
                            let value;
                            switch (type) {
                                case world_1.GameRuleType.BOOL:
                                    value = data.readBoolean();
                                    break;
                                case world_1.GameRuleType.INT:
                                    value = data.readUnsignedVarInt();
                                    break;
                                case world_1.GameRuleType.FLOAT:
                                    value = data.readLFloat();
                                    break;
                                default:
                                    Packet_1.Packet.logger.error(`Unknown GameRuleType (DECODE): ${type}`);
                                    return;
                            }
                            props.gameRules.push({ name, type, value });
                        }
                    }
                    else {
                        data.writeUnsignedVarInt(value.length);
                        for (const rule of value) {
                            data.writeString(rule.name);
                            data.writeUnsignedVarInt(rule.type);
                            switch (rule.type) {
                                case world_1.GameRuleType.BOOL:
                                    data.writeBoolean(rule.value);
                                    break;
                                case world_1.GameRuleType.INT:
                                    data.writeUnsignedVarInt(rule.value);
                                    break;
                                case world_1.GameRuleType.FLOAT:
                                    data.writeLFloat(rule.value);
                                    break;
                                default:
                                    Packet_1.Packet.logger.error(`Unknown GameRuleType (ENCODE): ${type}`);
                                    return;
                            }
                        }
                    }
                },
                resolve: def([{ name: 'naturalregeneration', type: world_1.GameRuleType.BOOL, value: false }]),
            },
            { name: 'bonusChestEnabled', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'startWithMapEnabled', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'defaultPlayerPermission', parser: data_1.DataType.VARINT, resolve: def(world_1.PlayerPermissions.MEMBER) },
            { name: 'serverChunkTickRadius', parser: data_1.DataType.L_INT, resolve: def(4) },
            { name: 'hasLockedBehaviorPack', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'hasLockedResourcePack', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'fromLockedWorldTemplate', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'useMsaGamertagsOnly', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'fromWorldTemplate', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'worldTemplateOptionLocked', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'onlySpawnV1Villagers', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'vanillaVersion', parser: data_1.DataType.STRING, resolve: def(protocol_1.Protocol.BEDROCK_VERSION) },
            { name: 'limitedWorldWidth', parser: data_1.DataType.L_INT, resolve: def(0) },
            { name: 'limitedWorldLength', parser: data_1.DataType.L_INT, resolve: def(0) },
            { name: 'newNether', parser: data_1.DataType.BOOLEAN, resolve: def(true) },
            {
                name: 'someExperimentalBullshit',
                parser({ type, data }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        if (data.readBoolean())
                            data.readBoolean();
                    }
                    else {
                        data.writeBoolean(false);
                    }
                },
            },
            { name: 'levelId', parser: data_1.DataType.STRING, resolve: def('') },
            { name: 'worldName', parser: data_1.DataType.STRING, resolve: def('Hyperstone Network') },
            { name: 'premiumWorldTemplateId', parser: data_1.DataType.STRING, resolve: def('') },
            { name: 'isTrial', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'isMovementServerAuthoritative', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
            { name: 'currentTick', parser: data_1.DataType.L_LONG, resolve: def(0n) },
            { name: 'enchantmentSeed', parser: data_1.DataType.VARINT, resolve: def(0) },
            {
                name: 'states',
                parser({ type, data }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.append(fs_1.default.readFileSync(path_1.default.join(__dirname, '..', '..', 'data', 'block_states.nbt')));
                    }
                    else if (type === Packet_1.ParserType.DECODE) {
                        data.pos += 1063028;
                    }
                },
            },
            {
                name: 'legacyIdMap',
                parser({ type, data, props, value }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.legacyIdMap = {};
                        const count = data.readUnsignedVarInt();
                        for (let i = 0; i < count; i++) {
                            props.legacyIdMap[data.readString()] = data.readSignedLShort();
                        }
                    }
                    else {
                        const ids = Object.entries(value);
                        data.writeUnsignedVarInt(ids.length);
                        for (const [newId, legacyId] of ids) {
                            data.writeString(newId);
                            data.writeSignedLShort(legacyId);
                        }
                    }
                },
                resolve: def(legacy_id_map_json_1.default),
            },
            { name: 'multiplayerCorrelationId', parser: data_1.DataType.STRING, resolve: def('') },
            { name: 'enableNewInventorySystem', parser: data_1.DataType.BOOLEAN, resolve: def(false) },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.StartGame = StartGame;
