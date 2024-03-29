import { Vector3 } from '@strdstnet/utils.binary'
import { Client } from '../network/Client'

interface SkinImage {
  height: number,
  width: number,
  data: Buffer,
}

export enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

enum SkinAnimationType {
  HEAD    = 1,
  BODY_32 = 2,
  BODY_64 = 3,
}

interface SkinAnimation {
  image: SkinImage,
  type: SkinAnimationType,
  frames: number,
  expression: number,
}

interface Cape {
  id: string,
  image: SkinImage,
}

export enum PersonaTintablePieceType {
  EYES  = 'persona_eyes',
  HAIR  = 'persona_hair',
  MOUTH = 'persona_mouth',
}

export enum PersonaPieceType {
  BODY        = 'persona_body',
  BOTTOM      = 'persona_bottom',
  EYES        = 'persona_eyes',
  FACIAL_HAIR = 'persona_facial_hair',
  FEET        = 'persona_feet',
  HAIR        = 'persona_hair',
  MOUTH       = 'persona_mouth',
  SKELETON    = 'persona_skeleton',
  SKIN        = 'persona_skin',
  TOP         = 'persona_top',
}

interface PersonaPiece {
  id: string,
  type: PersonaPieceType,
  packId: string,
  defaultPiece: boolean,
  productId: string,
}

interface PersonaPieceTint {
  type: PersonaTintablePieceType,
  colors: string[],
}

interface SkinCape {
  id: string,
  image: SkinImage,
}

export interface SkinData {
  id: string,
  playFabId: string,
  // fullId: string,
  color: string,
  resourcePatch: Buffer,
  image: SkinImage,
  animations: SkinAnimation[],
  cape: SkinCape,
  geometryData: Buffer,
  animationData: Buffer,
  persona: boolean,
  premium: boolean,
  personaCapeOnClassic: boolean,
  armSize: string, // TODO: Parse into number?
  personaPieces: PersonaPiece[],
  personaPieceTints: PersonaPieceTint[],
  verified: boolean,
}

interface IPlayerPosition {
  x: number,
  y: number,
  z: number,
  pitch: number,
  yaw: number,
  headYaw: number,
  motion: Vector3,
  onGround: boolean,
  coords: Vector3,
  acknowledgeUpdate: () => void,
  update: (...args: any[]) => void,
}

export interface IPlayer {
  username: string,
  UUID: any,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
  client: Client,
  skinData: SkinData,
  position: IPlayerPosition,
  sendMessage: (message: string, type?: number, parameters?: string[]) => void,
  teleport: (x: number, y: number, z: number) => void,
}

export enum PlayerEventAction {
  START_BREAK    = 0,
  ABORT_BREAK    = 1,
  STOP_BREAK     = 2,
  RESPAWN        = 7,
  JUMP           = 8,
  START_SPRINT   = 9,
  STOP_SPRINT    = 10,
  START_SNEAK    = 11,
  STOP_SNEAK     = 12,
  CONTINUE_BREAK = 18,
  START_SWIMMING = 21,
  STOP_SWIMMING  = 22,
  INTERACT_BLOCK = 25,
}

export enum PlayerAnimation {
  SWING_ARM            = 1,
  STOP_SLEEP           = 3,
  CRITICAL_HIT         = 4,
  MAGICAL_CRITICAL_HIT = 5,
}

export enum LevelEventType {
  PARTICLE_DESTROY     = 2001,
  PARTICLE_PUNCH_BLOCK = 2014,
  START_RAIN           = 3001,
  PAUSE_GAME           = 3005,
  BLOCK_START_BREAK    = 3600,
  BLOCK_STOP_BREAK     = 3601,
}

export enum EntityAnimationType {
  JUMP  = 1,
  HURT  = 2,
  DEATH = 3,
}

export enum DamageCause {
  GENERIC            = 'death.attack.generic',
  FALLING_ANVIL      = 'death.attack.anvil',
  ARROW              = 'death.attack.arrow',
  ARROW_ITEM         = 'death.attack.arrow.item',
  CACTUS             = 'death.attack.cactus',
  CACTUS_PVP         = 'death.attack.cactus.player',
  DROWNED            = 'death.attack.drown',
  DROWNED_PVP        = 'death.attack.drown.player',
  EXPLOSION          = 'death.attack.explosion',
  EXPLOSION_PVP      = 'death.attack.explosion.player',
  FALLING_BLOCK      = 'death.attack.fallingBlock',
  FIREBALL           = 'death.attack.fireball',
  FIREBALL_ITEM      = 'death.attack.fireball.item',
  FIREWORKS          = 'death.attack.fireworks',
  FLIED_INTO_WALL    = 'death.attack.flyIntoWall',
  MAGIC              = 'death.attack.magic',
  MAGIC_PLAYER       = 'death.attack.indirectMagic',
  MAGIC_PLAYER_ITEM  = 'death.attack.indirectMagic.item',
  IN_FIRE            = 'death.attack.inFire',
  IN_FIRE_PVP        = 'death.attack.inFire.player',
  SUFFOCATE          = 'death.attack.inWall',
  LAVA               = 'death.attack.lava',
  LAVA_PVP           = 'death.attack.lava.player',
  LIGHTNING          = 'death.attack.lightningBolt',
  MAGMA              = 'death.attack.magma',
  MAGMA_PVP          = 'death.attack.magma.player',
  MOB                = 'death.attack.mob',
  ON_FIRE            = 'death.attack.onFire',
  ON_FIRE_PVP        = 'death.attack.onFire.player',
  VOID               = 'death.attack.outOfWorld',
  PVP                = 'death.attack.player',
  PVP_ITEM           = 'death.attack.player.item',
  STARVATION         = 'death.attack.starve',
  THORNS             = 'death.attack.thorns',
  PUMMELED           = 'death.attack.thrown',
  PUMMELED_ITEM      = 'death.attack.thrown.item',
  WITHER             = 'death.attack.wither',
  FALL               = 'death.attack.fall',
  FALL_ACCIDENT      = 'death.fell.accident.generic',
  FALL_LADDER        = 'death.fell.accident.ladder',
  FALL_VINES         = 'death.fell.accident.vines',
  FALL_WATER         = 'death.fell.accident.water',
  FALL_DOOMED        = 'death.fell.killer',
  FALL_DOOMED_PVP    = 'death.fell.assist',
  FALL_DOOMED_ITEM   = 'death.fell.assist.item',
  FALL_FINISHED      = 'death.fell.finish',
  FALL_FINISHED_ITEM = 'death.fell.finish.item',
}
