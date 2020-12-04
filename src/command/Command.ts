

import { ArgType, CommandPermissions, ICommandArgument } from '@strdstnet/protocol'
import { ICommandExecute, ICreateCommand } from '../types/commands'

export abstract class Command {

  public name: string
  public trigger: string
  public description: string
  public args: ICommandArgument[]
  public argsUsage: string
  public permission: CommandPermissions

  constructor(cmd: ICreateCommand) {
    this.name = cmd.name
    this.trigger = cmd.trigger
    this.description = cmd.description || ''
    this.args = cmd.args || []
    this.argsUsage = cmd.usage || ''
    this.permission = typeof cmd.permission !== 'undefined' ? cmd.permission : CommandPermissions.NORMAL
  }

  public get usage(): string {
    let usage = `Usage: /${this.trigger}`

    for(const arg of this.args) {
      if(arg.optional) usage += ` [${arg.name}: ${Command.argTypeToString(arg.type)}]`
      else usage += ` <${arg.name}: ${Command.argTypeToString(arg.type)}>`
    }

    return usage
  }

  public abstract async execute(args: ICommandExecute): Promise<void>

  public static argTypeToString(type: ArgType): string {
    switch(type) {
      case ArgType.INT:
        return 'int'
      case ArgType.FLOAT:
        return 'float'
      case ArgType.VALUE:
        return 'value'
      case ArgType.WILDCARD_INT:
        return 'wildcard int' // ?
      case ArgType.OPERATOR:
        return 'operator'
      case ArgType.TARGET:
        return 'target'
      case ArgType.FILE_PATH:
        return 'file path'
      case ArgType.STRING:
        return 'string'
      case ArgType.POSITION:
        return 'position'
      case ArgType.MESSAGE:
        return 'message'
      case ArgType.RAW_TEXT:
        return 'raw text'
      case ArgType.JSON:
        return 'json'
      case ArgType.COMMAND:
        return 'command'
      default:
        return 'unknown'
    }
  }

}
