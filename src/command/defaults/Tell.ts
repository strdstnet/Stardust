import { Command } from '../Command'
import { Chat } from '../../Chat'
import { ICommandExecute, ArgType } from '../../types/commands'

export class Tell extends Command {

  constructor() {
    super({
      name: 'Tell',
      trigger: 'tell',
      description: 'Send someone a private message',
      usage: '<message>',
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
