import { EntityPosition } from '../entity/EntityPosition'
import { TextType } from '../network/bedrock/Text'
import { UUID } from '../utils/UUID'

export interface SkinImage {
  height: number,
  width: number,
  data: Buffer,
}

export enum SkinAnimationType {
  HEAD    = 1,
  BODY_32 = 2,
  BODY_64 = 3,
}

export interface SkinAnimation {
  image: SkinImage,
  type: SkinAnimationType,
  frames: number,
}

export interface Cape {
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

export interface PersonaPiece {
  id: string,
  type: PersonaPieceType,
  packId: string,
  defaultPiece: boolean,
  productId: string,
}

export interface PersonaPieceTint {
  type: PersonaTintablePieceType,
  colors: string[],
}

export interface SkinCape {
  id: string,
  image: SkinImage,
}

export interface SkinData {
  id: string,
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

export interface IPlayer {
  username: string,
  UUID: UUID,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
  skinData: SkinData,
  position: EntityPosition,
  sendMessage: (message: string, type?: TextType, parameters?: string[]) => void,
  teleport: (x: number, y: number, z: number) => void,
}

export enum MetadataType {
  BYTE = 0,
  SHORT = 1,
  INT = 2,
  FLOAT = 3,
  STRING = 4,
  ITEM = 5,
  POSITION = 6,
  LONG = 7,
  VECTOR = 8,
}

export enum MetadataFlag {
  FLAGS = 0,
  HEALTH = 1,
  VARIANT = 2,
  COLOR = 3,
  NAMETAG = 4,
  ENTITY_OWNER_ID = 5,
  ENTITY_TARGET_ID = 6,
  AIR = 7,
  BREATHING = 35,
  ENTITY_LEAD_HOLDER_ID = 37,
  SCALE = 38,
  MAX_AIR = 42,
  BOUNDING_BOX_WIDTH = 53,
  BOUNDING_BOX_HEIGHT = 54,
  FLAGS_EXTENDED = 91,
}

export enum MetadataGeneric {
  ON_FIRE = 0,
  SNEAKING = 1,
  IMMOBILE = 16,
  CAN_FLY = 21,
  HAS_COLLISION = 47,
  AFFECTED_BY_GRAVITY = 48,
}

export enum InteractAction {
  LEAVE_VEHICLE = 3,
  MOUSE_OVER = 4,
  OPEN_NPC = 5,
  OPEN_INVENTORY = 6,
}

export enum PlayerEventAction {
  START_BREAK = 0,
  ABORT_BREAK = 1,
  STOP_BREAK = 2,
  START_SNEAK = 11,
  CONTINUE_BREAK = 18,
}

export enum LevelEventType {
  BLOCK_START_BREAK = 3600,
  BLOCK_STOP_BREAK = 3601,
  PARTICLE_PUNCH_BLOCK = 2014,
}
