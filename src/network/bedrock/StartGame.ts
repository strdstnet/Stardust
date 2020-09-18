import { BatchedPacket } from './BatchedPacket'
import { Vector3 } from 'math3d'
import {
  Packets,
  DataType,
  Gamemode,
  BiomeType,
  Dimension,
  Difficulty,
  GeneratorType,
  GameRuleType,
  IBoolGameRule,
  IIntGameRule,
  IFloatGameRule,
  PlayerPosition,
  Protocol,
  PlayerPermissions,
  MultiplayerVisibility,
} from '../../types'
import { ParserType, Packet } from '../Packet'
import LegacyIdMap from '../../data/legacy_id_map.json'
import fs from 'fs'
import path, { dirname } from 'path'

interface IStartGameRequired {
  entityUniqueId: bigint,
  entityRuntimeId: bigint,
  playerPosition: PlayerPosition,
}

interface IStartGameOptional {
  playerGamemode: Gamemode,
  seed: number,
  biomeType: BiomeType,
  biomeName: string,
  dimension: Dimension,
  generator: GeneratorType,
  worldGamemode: Gamemode,
  difficulty: Difficulty,
  spawnLocation: Vector3,
  achievementsDisabled: boolean,
  time: number,
  eduEditionOffer: number,
  eduFeaturesEnabled: boolean,
  eduProductUUID: string,
  rainLevel: number,
  lightningLevel: number,
  hasConfirmedPlatformLockedContent: boolean,
  isMultiplayerGame: boolean,
  hasLANBroadcast: boolean,
  xboxLiveBroadcastMode: MultiplayerVisibility,
  platformBroadcastMode: MultiplayerVisibility,
  commandsEnabled: boolean,
  texturePacksRequired: boolean,
  gameRules: Array<IBoolGameRule | IIntGameRule | IFloatGameRule>,
  bonusChestEnabled: boolean,
  startWithMapEnabled: boolean,
  defaultPlayerPermission: PlayerPermissions,
  serverChunkTickRadius: number,
  hasLockedBehaviorPack: boolean,
  hasLockedResourcePack: boolean,
  fromLockedWorldTemplate: boolean,
  useMsaGamertagsOnly: boolean,
  fromWorldTemplate: boolean,
  worldTemplateOptionLocked: boolean,
  onlySpawnV1Villagers: boolean,
  vanillaVersion: string,
  limitedWorldWidth: number,
  limitedWorldLength: number,
  newNether: boolean,
  levelId: string,
  worldName: string,
  premiumWorldTemplateId: string,
  isTrial: boolean,
  isMovementServerAuthoritative: boolean,
  currentTick: bigint,
  enchantmentSeed: number,
  legacyIdMap: {
    [k: string]: number, // newId: legacyId - { "minecraft:dirt": 3 }
  },
  multiplayerCorrelationId: string,
  enableNewInventorySystem: boolean,
}

type IStartGame = IStartGameRequired & IStartGameOptional

const def = (val: any) => () => val

export class StartGame extends BatchedPacket<IStartGame> {

  constructor(p?: IStartGameRequired & Partial<IStartGameOptional>) {
    super(Packets.START_GAME, [
      { name: 'entityUniqueId', parser: DataType.VARLONG },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'playerGamemode', parser: DataType.VARINT, resolve: def(Gamemode.SURVIVAL) },
      {
        name: 'playerPosition',
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            const v3 = data.readVector3()

            props.playerPosition = new PlayerPosition(
              v3.x,
              v3.y,
              v3.z,
              data.readLFloat(),
              data.readLFloat(),
            )
          } else {
            const pos = props.playerPosition
            data.writeVector3(pos.location)
            data.writeLFloat(pos.pitch)
            data.writeLFloat(pos.yaw)
          }
        },
      },
      { name: 'seed', parser: DataType.VARINT, resolve: def(0) },
      { name: 'biomeType', parser: DataType.L_SHORT, resolve: def(0) },
      { name: 'biomeName', parser: DataType.STRING, resolve: def('') },
      { name: 'dimension', parser: DataType.VARINT, resolve: def(Dimension.OVERWOLD) },
      { name: 'generator', parser: DataType.VARINT, resolve: def(GeneratorType.OVERWORLD) },
      { name: 'worldGamemode', parser: DataType.VARINT, resolve: def(Gamemode.SURVIVAL) },
      { name: 'difficulty', parser: DataType.VARINT, resolve: def(Difficulty.PEACEFUL) },
      {
        name: 'spawnLocation',
        parser({ type, data, props, value }) {
          if(type === ParserType.DECODE) {
            props.spawnLocation = new Vector3(
              data.readVarInt(),
              data.readUnsignedVarInt(),
              data.readVarInt(),
            )
          } else {
            data.writeVarInt(value.x)
            data.writeUnsignedVarInt(value.y)
            data.writeVarInt(value.z)
          }
        },
        resolve: def(new Vector3(5, 5, 5)),
      },
      { name: 'achievementsDisabled', parser: DataType.BOOLEAN, resolve: def(true) },
      { name: 'time', parser: DataType.VARINT, resolve: def(0) },
      { name: 'eduEditionOffer', parser: DataType.VARINT, resolve: def(0) },
      { name: 'eduFeaturesEnabled', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'eduProductUUID', parser: DataType.STRING, resolve: def('') },
      { name: 'rainLevel', parser: DataType.L_FLOAT, resolve: def(0) },
      { name: 'lightningLevel', parser: DataType.L_FLOAT, resolve: def(0) },
      { name: 'hasConfirmedPlatformLockedContent', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'isMultiplayerGame', parser: DataType.BOOLEAN, resolve: def(true) },
      { name: 'hasLANBroadcast', parser: DataType.BOOLEAN, resolve: def(true) },
      { name: 'xboxLiveBroadcastMode', parser: DataType.VARINT, resolve: def(MultiplayerVisibility.PUBLIC) },
      { name: 'platformBroadcastMode', parser: DataType.VARINT, resolve: def(MultiplayerVisibility.PUBLIC) },
      { name: 'commandsEnabled', parser: DataType.BOOLEAN, resolve: def(true) },
      { name: 'texturePacksRequired', parser: DataType.BOOLEAN, resolve: def(true) },
      {
        name: 'gameRules',
        parser({ type, data, props, value }) {
          if(type === ParserType.DECODE) {
            props.gameRules = []

            for(let i = 0; i < data.readUnsignedVarInt(); i++) {
              const name = data.readString()
              const type = data.readUnsignedVarInt()
              let value: any

              switch(type) {
                case GameRuleType.BOOL:
                  value = data.readBoolean()
                  break
                case GameRuleType.INT:
                  value = data.readUnsignedVarInt()
                  break
                case GameRuleType.FLOAT:
                  value = data.readLFloat()
                  break
                default:
                  Packet.logger.error(`Unknown GameRuleType (DECODE): ${type}`)
                  return
              }

              props.gameRules.push({ name, type, value })
            }
          } else {
            data.writeUnsignedVarInt(value.length)

            for(const rule of value) {
              data.writeString(rule.name)
              data.writeUnsignedVarInt(rule.type)

              switch(rule.type) {
                case GameRuleType.BOOL:
                  data.writeBoolean(rule.value)
                  break
                case GameRuleType.INT:
                  data.writeUnsignedVarInt(rule.value)
                  break
                case GameRuleType.FLOAT:
                  data.writeLFloat(rule.value)
                  break
                default:
                  Packet.logger.error(`Unknown GameRuleType (ENCODE): ${type}`)
                  return
              }
            }
          }
        },
        resolve: def([{ name: 'naturalregeneration', type: GameRuleType.BOOL, value: false }]),
      },
      { name: 'bonusChestEnabled', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'startWithMapEnabled', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'defaultPlayerPermission', parser: DataType.VARINT, resolve: def(PlayerPermissions.MEMBER) },
      { name: 'serverChunkTickRadius', parser: DataType.L_INT, resolve: def(32) },
      { name: 'hasLockedBehaviorPack', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'hasLockedResourcePack', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'fromLockedWorldTemplate', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'useMsaGamertagsOnly', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'fromWorldTemplate', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'worldTemplateOptionLocked', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'onlySpawnV1Villagers', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'vanillaVersion', parser: DataType.STRING, resolve: def(Protocol.BEDROCK_VERSION) },
      { name: 'limitedWorldWidth', parser: DataType.L_INT, resolve: def(0) },
      { name: 'limitedWorldLength', parser: DataType.L_INT, resolve: def(0) },
      { name: 'newNether', parser: DataType.BOOLEAN, resolve: def(false) },
      {
        name: 'someExperimentalBullshit',
        parser({ type, data }) {
          if(type === ParserType.DECODE) {
            if(data.readBoolean()) data.readBoolean()
          } else {
            data.writeBoolean(false)
          }
        },
      },
      { name: 'levelId', parser: DataType.STRING, resolve: def('') },
      { name: 'worldName', parser: DataType.STRING, resolve: def('') },
      { name: 'premiumWorldTemplateId', parser: DataType.STRING, resolve: def('') },
      { name: 'isTrial', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'isMovementServerAuthoritative', parser: DataType.BOOLEAN, resolve: def(false) },
      { name: 'currentTick', parser: DataType.L_LONG, resolve: def(0n) },
      { name: 'enchantmentSeed', parser: DataType.VARINT, resolve: def(0) },
      {
        name: 'states',
        parser({ type, data }) {
          if (type === ParserType.ENCODE) {
            data.append(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'block_states.nbt')))
          }
        },
      },
      {
        name: 'legacyIdMap',
        parser({ type, data, props, value }) {
          if(type === ParserType.DECODE) {
            props.legacyIdMap = {}

            for(let i = 0; i < data.readUnsignedVarInt(); i++) {
              props.legacyIdMap[data.readString()] = data.readSignedLShort()
            }
          } else {
            const ids = Object.entries(value as Record<string, number>)

            data.writeUnsignedVarInt(ids.length)

            for(const [newId, legacyId] of ids) {
              data.writeString(newId)
              data.writeSignedLShort(legacyId)
            }
          }
        },
        resolve: def(LegacyIdMap),
      },
      { name: 'multiplayerCorrelationId', parser: DataType.STRING, resolve: def('') },
      { name: 'enableNewInventorySystem', parser: DataType.BOOLEAN, resolve: def(false) }, // TODO: Automatic crafting, etc...
    ])

    if(p) this.props = Object.assign({}, p as IStartGame)
  }

}
