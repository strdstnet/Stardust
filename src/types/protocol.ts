import { IAddress } from './network'

export enum Packets {
  /* RAKNET (Raw) */
  CONNECTED_PING = 0x00, // 0
  UNCONNECTED_PING = 0x01, // 1
  PING_OPEN_CONNECTIONS = 0x02, // 2
  CONNECTED_PONG = 0x03, // 3
  OPEN_CONNECTION_REQUEST_ONE = 0x05, // 5
  OPEN_CONNECTION_REPLY_ONE = 0x06, // 6
  OPEN_CONNECTION_REQUEST_TWO = 0x07, // 7
  OPEN_CONNECTION_REPLY_TWO = 0x08, // 8
  UNCONNECTED_PONG = 0x1c, // 28

  /* RAKNET (Bundled) */
  CONNECTION_REQUEST = 0x09, // 9
  CONNECTION_REQUEST_ACCEPTED = 0x10, // 16
  NEW_INCOMING_CONNECTION = 0x13, // 19
  DISCONNECTION_NOTIFICATION = 0x15, // 21
  INCOMPATIBLE_PROTOCOL = 0x19, // 25


  ACK = 0xc0, // 192
  NAK = 0xa0, // 160

  DATA_PACKET_0 = 0x80,
  DATA_PACKET_1 = 0x81,
  DATA_PACKET_2 = 0x82,
  DATA_PACKET_3 = 0x83,
  DATA_PACKET_4 = 0x84,
  DATA_PACKET_5 = 0x85,
  DATA_PACKET_6 = 0x86,
  DATA_PACKET_7 = 0x87,
  DATA_PACKET_8 = 0x88,
  DATA_PACKET_9 = 0x89,
  DATA_PACKET_A = 0x8a,
  DATA_PACKET_B = 0x8b,
  DATA_PACKET_C = 0x8c,
  DATA_PACKET_D = 0x8d,
  DATA_PACKET_E = 0x8e,
  DATA_PACKET_F = 0x8f,

  PACKET_BATCH = 0xFE, // 254


  /* BEDROCK (Batched) */
  LOGIN = 0x01, // 1
  PLAY_STATUS = 0x02, // 2
  DISCONNECT = 0x05, // 5
  RESOURCE_PACKS_INFO = 0x06, // 6
  RESOURCE_PACKS_STACK = 0x07, // 7
  RESOURCE_PACKS_RESPONSE = 0x08, // 8
  TEXT = 0x09, // 9
  SET_TIME = 0x0a, // 10
  START_GAME = 0x0b, // 11
  ADD_PLAYER = 0x0c, // 12
  MOVE_PLAYER = 0x13, // 19
  TICK_SYNC = 0x17, // 23
  ENTITY_METADATA = 0x1b, // 27
  UPDATE_ATTRIBUTES = 0x1d, // 29
  ENTITY_NOTIFICATION = 0x27, // 39
  SET_SPAWN_POSITION = 0x2b, // 43
  RESPAWN = 0x2d, // 45
  CONTAINER_NOTIFICATION = 0x31,// 49
  ADVENTURE_SETTINGS = 0x37, // 55
  LEVEL_CHUNK = 0x3a, // 58
  CHANGE_DIMENSION = 0x3d, // 61
  SET_GAMEMODE = 0x3e, // 62
  PLAYER_LIST = 0x3f, // 63
  REQUEST_CHUNK_RADIUS = 0x45, // 69
  CHUNK_RADIUS_UPDATED = 0x46, // 70
  AVAILABLE_COMMANDS = 0x4c, // 76
  COMMAND_REQUEST = 0x4d, // 77
  TRANSFER = 0x55, // 85
  SET_TITLE = 0x58, // 88
  SET_LOCAL_PLAYER_INITIALIZED = 0x71, // 113
  ENTITY_DEFINITION_LIST = 0x77, // 119
  NETWORK_CHUNK_PUBLISHER = 0x79, // 121
  BIOME_DEFINITION_LIST = 0x7a, // 122
  PACKET_VIOLATION_WARNING = 0x9c, // 156
}

export const Protocol = {
  PROTOCOL_VERSION: 10,
  BEDROCK_VERSION: '1.16.40',
  SERVER_ID: 925686942n,
  SYSTEM_ADDRESSES: 20,
  DEFAULT_MTU: 1347,
  MAGIC: '\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78',
}

export const DummyAddress: IAddress = {
  ip: '0.0.0.0',
  port: 19132,
  family: 4,
}

export enum PacketViolationType {
  MALFORMED = 0,
}

export enum PacketViolationSeverity {
  WARNING = 0,
  FINAL_WARNING = 1,
  TERMINATING_CONNECTION = 2,
}

export interface IChainData {
  chain: [string, string, string],
}

export interface IToken {
  identityPublicKey: string,
  exp: number,
  nbf: number,
  certificateAuthority?: boolean,
  randomNonce?: number,
  iss?: string,
  iat?: number,
  extraData?: {
    XUID: string,
    identity: string,
    displayName: string,
    titleId: string,
  },
}

export interface IClientDataPersonaPiece {
  PieceId: string,
  PieceType: string,
  PackId: string,
  IsDefault: boolean,
  ProductId: string,
}

export interface IClientDataPieceTintColor {
  PieceType: string,
  Colors: string[],
}

export interface IClientData {
  ClientRandomId: number,
  ServerAddress: string,
  SkinId: string,
  SkinResourcePatch: string, // Base64
  SkinImageHeight: number,
  SkinImageWidth: number,
  SkinData: string, // Base64
  CapeImageHeight: number,
  CapeImageWidth: number,
  CapeData: string, // Base64
  SkinGeometryData: string, // Base64
  SkinAnimationData: string, // Base64
  PremiumSkin: boolean,
  PersonaSkin: boolean,
  CapeOnClassicSkin: boolean,
  CapeId: string,
  ArmSize: string,
  SkinColor: string,
  PersonaPieces: IClientDataPersonaPiece[],
  PieceTintColors: IClientDataPieceTintColor[],
}
