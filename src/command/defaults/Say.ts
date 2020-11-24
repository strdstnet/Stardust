import { Command } from '../Command'
import { Chat } from '../../Chat'
import { ICommandExecute, ArgType } from '../../types/commands'

export class Say extends Command {

  constructor() {
    super({
      name: 'Say',
      trigger: 'say',
      description: 'Say something',
      usage: '<message>',
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
