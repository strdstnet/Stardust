import { Command } from '../Command'
import { Chat } from '../../Chat'
import { ICommandExecute, ArgType } from '../../types/commands'

export class Help extends Command {

  constructor() {
    super({
      name: 'Help',
      trigger: 'help',
      description: 'Get command help',
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    executor.sendMessage('Help')
  }

}
