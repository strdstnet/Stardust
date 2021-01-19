import { Command } from '../Command'
import { Chat } from '../../Chat'
import { ICommandExecute } from '../../types/commands'
import { ArgType } from '@strdstnet/protocol'

export class Tell extends Command {

  constructor() {
    super({
      name: 'tell',
      description: 'Send someone a private message',
      args: [
        { name: 'player', type: ArgType.TARGET, optional: false },
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
