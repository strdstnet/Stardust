import { Command } from '../Command'
import { Chat } from '../../Chat'
import { ICommandExecute } from '../../types/commands'
import { ArgType } from '@strdstnet/protocol'

export class Say extends Command {

  constructor() {
    super({
      name: 'say',
      description: 'Say something',
      args: [
        { name: 'message', type: ArgType.RAW_TEXT, optional: false },
      ],
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    if(args.length < 1) {
      return executor.sendMessage(this.usage)
    }

    Chat.i.say(executor.name, args.join(' '))
  }

}
