

import { ArgType, CommandPermissions, ICommandArgument } from '@strdstnet/protocol'
import { Console } from '../console/Console'
import { Player } from '../Player'
import { ICommandExecute, ICreateCommand } from '../types/commands'

export abstract class Command {

  public name: string
  public trigger: string
  public description: string
  public args: ICommandArgument[]
  public consoleArgs: ICommandArgument[]
  public permission: CommandPermissions

  constructor(cmd: ICreateCommand) {
    this.name = cmd.name
    this.trigger = cmd.trigger
    this.description = cmd.description || ''
    this.args = cmd.args || []
    this.consoleArgs = cmd.consoleArgs || this.args
    this.permission = typeof cmd.permission !== 'undefined' ? cmd.permission : CommandPermissions.NORMAL
  }

  public get usage(): string {
    return this.getUsageFor('player')
  }

  public get consoleUsage(): string {
    return this.getUsageFor('console')
  }

  public get requiredArgs(): ICommandArgument[] {
    return this.args.filter(arg => !arg.optional)
  }

  public get optionalArgs(): ICommandArgument[] {
    return this.args.filter(arg => arg.optional)
  }

  public get requiredConsoleArgs(): ICommandArgument[] {
    return this.consoleArgs.filter(arg => !arg.optional)
  }

  public get optionalConsoleArgs(): ICommandArgument[] {
    return this.consoleArgs.filter(arg => arg.optional)
  }

  public async execute({ executor }: ICommandExecute): Promise<void> {
    executor.sendMessage('Command not implemented')
  }

  public getUsageFor(executor: 'player' | 'console'): string {
    const args = executor === 'console' ? this.consoleArgs : this.args
    let usage = `Usage: /${this.trigger}`

    for(const arg of args) {
      if(arg.optional) usage += ` [${arg.name}: ${Command.argTypeToString(arg.type)}]`
      else usage += ` <${arg.name}: ${Command.argTypeToString(arg.type)}>`
    }

    return usage
  }

  public getUsage(executor: Player | Console): string {
    return this.getUsageFor(executor instanceof Console ? 'console' : 'player')
  }

  public validate({ args, executor }: ICommandExecute): boolean {
    const requiredArgs = executor instanceof Console ? this.requiredConsoleArgs : this.requiredArgs

    if(args.length < requiredArgs.length) return false

    return true
  }

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
