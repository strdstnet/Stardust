import { IPlayer } from './player'

export interface ICreateCommand {
  name: string,
  triggers: string[],
  description?: string,
  usage?: string,
}

export interface ICommandExecute {
  trigger: string,
  args: string[],
  sender: IPlayer,
}

export interface ICommand {
  name: string,
  triggers: string[],
  description: string,

  execute: (args: ICommandExecute) => Promise<void>
}

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
