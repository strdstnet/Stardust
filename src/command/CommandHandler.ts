import { Player } from '../Player'
import { Console } from '../console/Console'
import { CommandMap } from './CommandMap'

import * as DefaultCommands from './defaults'
import { InvalidCommand } from './errors'

export abstract class CommandHandler {

  public static commands = new CommandMap()

  public static async init(): Promise<void> {
    for(const Command of Object.values(DefaultCommands)) {
      const cmd = new Command()
      this.commands.set(cmd.trigger, cmd)
    }
  }

  public static async handle(trigger: string, executor: Player | Console, args: any[]): Promise<void> {
    const command = this.commands.get(trigger)

    if(!command) throw new InvalidCommand()

    return command.execute({
      args,
      executor,
    })
  }

  public static get parseRegex(): RegExp {
    return /[^\s"]+|"([^"]*)"/g
  }

  public static parse(input: string): string[] {
    const parts = []

    const matches = input.matchAll(CommandHandler.parseRegex)
    for(const match of matches) {
      parts.push(typeof match[1] === 'undefined' ? match[0] : match[1])
    }

    return parts
  }

}