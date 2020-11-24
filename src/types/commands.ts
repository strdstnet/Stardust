import { Player } from '../Player'
import { Console } from '../console/Console'
import { CommandPermissions } from './world'

export enum CommandOriginType {
  PLAYER = 0,
  BLOCK = 1,
  MINECART_BLOCK = 2,
  DEV_CONSOLE = 3,
  TEST = 4,
  PLAYER_AUTOMATION = 5,
  CLIENT_AUTOMATION = 6,
  DEDICATED_SERVER = 7,
  ENTITY = 8,
  VIRTUAL = 9,
  GAME_ARGUMENT = 10,
  ENTITY_SERVER = 11,
}

export interface ICommandArgument {
  name: string,
  type: ArgType,
  optional: boolean,
}

export interface ICreateCommand {
  name: string,
  trigger: string,
  description?: string,
  args?: ICommandArgument[],
  usage?: string,
  permission?: CommandPermissions,
  playerExecutable?: boolean,
  consoleExecutable?: boolean,
}

export interface ICommandExecute {
  args: string[],
  executor: Player | Console,
}

export enum ArgType {
  INT = 0x01,
  FLOAT = 0x02,
  VALUE = 0x03,
  WILDCARD_INT = 0x04,
  OPERATOR = 0x05,
  TARGET = 0x06,
  FILE_PATH = 0x0e,
  STRING = 0x1d,
  POSITION = 0x25,
  MESSAGE = 0x29,
  RAW_TEXT = 0x2b,
  JSON = 0x2f,
  COMMAND = 0x36,
}
