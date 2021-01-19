import { Command } from '../Command'
import { ICommandExecute } from '../../types/commands'

export class Help extends Command {

  constructor() {
    super({
      name: 'help',
      description: 'Get command help',
    })
  }

  public async execute({ executor }: ICommandExecute): Promise<void> {
    executor.sendMessage('Help')
  }

}
