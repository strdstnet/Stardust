export enum Dimension {
  OVERWOLD = 0,
  NETHER   = 1,
  END      = 2,
}

export enum Gamemode {
  SURVIVAL  = 0,
  CREATIVE  = 1,
  ADVENTURE = 2,
  SPECTATOR = 3,
}

export enum PlayStatusType {
  SUCCESS               = 0,
  CLIENT_FAILED         = 1,
  SERVER_FAILED         = 2,
  PLAYER_SPAWN          = 3,
  FAILED_INVALID_TENANT = 4,
  FAILED_VANILLA_EDU    = 5,
  FAILED_EDU_VANILLA    = 6,
  FAILED_SERVER_FULL    = 7,
}

export enum ResourcePackResponseStatus {
  NONE           = 0,
  REFUSED        = 1,
  SEND_PACKS     = 2,
  HAVE_ALL_PACKS = 3,
  COMPLETED      = 4,
}

export enum RespawnState {
  SEARCHING    = 0,
  SERVER_READY = 1,
  CLIENT_READY = 2,
}

export enum BiomeType {

}

export enum GeneratorType {
  FINITE_OVERWORLD = 0,
  OVERWORLD        = 1,
  FLAT             = 2,
  NETHER           = 3,
  END              = 4,
}

export enum Difficulty {
  PEACEFUL = 0,
  EASY     = 1,
  NORMAL   = 2,
  HARD     = 3,
}

export enum GameRuleType {
  BOOL  = 1,
  INT   = 2,
  FLOAT = 3,
}

export interface IGameRule {
  name: string,
  type: GameRuleType,
}

export interface IBoolGameRule extends IGameRule {
  type: GameRuleType.BOOL,
  value: boolean,
}

export interface IIntGameRule extends IGameRule {
  type: GameRuleType.INT,
  value: number,
}

export interface IFloatGameRule extends IGameRule {
  type: GameRuleType.FLOAT,
  value: number,
}

export enum PlayerPermissions {
  VISITOR  = 0,
  MEMBER   = 1,
  OPERATOR = 2,
  CUSTOM   = 3,
}

export enum CommandPermissions {
  NORMAL     = 0,
  OPERATOR   = 1,
  HOST       = 2,
  AUTOMATION = 3,
  ADMIN      = 4,
}

export const BITFLAG_SECOND_SET = 1 << 16
export enum AdventureSettingsFlag {
  WORLD_IMMUTABLE    = 0x01,
  NO_PVP             = 0x02,
  AUTO_JUMP          = 0x20,
  ALLOW_FLIGHT       = 0x40,
  NO_CLIP            = 0x80,
  WORLD_BUILDER      = 0x100,
  FLYING             = 0x200,
  MUTED              = 0x400,
  BUILD_AND_MINE     = 0x01 | BITFLAG_SECOND_SET,
  DOORS_AND_SWITCHES = 0x02 | BITFLAG_SECOND_SET,
  OPEN_CONTAINERS    = 0x04 | BITFLAG_SECOND_SET,
  ATTACK_PLAYERS     = 0x08 | BITFLAG_SECOND_SET,
  ATTACK_MOBS        = 0x10 | BITFLAG_SECOND_SET,
  OPERATOR           = 0x20 | BITFLAG_SECOND_SET,
  TELEPORT           = 0x80 | BITFLAG_SECOND_SET,
}

export enum Items {
  AIR = 0,
  STONE = 1,
  GRASS = 2,
  DIRT = 3,
  UPDATE_BLOCK = 248,
  SHIELD = 513,
}

export enum WorldSound {
  STEP = 2,
  PLACE = 6,
}
