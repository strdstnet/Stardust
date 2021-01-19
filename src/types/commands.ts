import { Player } from '../Player'
import { Console } from '../console/Console'
import { CommandPermissions, ICommandArgument } from '@strdstnet/protocol'

export interface ICreateCommand {
  name: string,
  description?: string,
  aliases?: string[],
  args?: ICommandArgument[],
  consoleArgs?: ICommandArgument[],
  permission?: CommandPermissions,
  playerExecutable?: boolean,
  consoleExecutable?: boolean,
}

export interface ICommandExecute {
  args: string[],
  executor: Player | Console,
}
