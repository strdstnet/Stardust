import { Player } from '../Player'
import { Console } from '../console/Console'
import { CommandPermissions, ICommandArgument } from '@strdstnet/protocol'

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
