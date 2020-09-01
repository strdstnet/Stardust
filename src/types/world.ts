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
