import { Command } from '../Command'
import { EzTransfer } from '../../network/custom/EzTransfer'

export class Transfer extends Command {

  constructor() {
    super({
      name: 'Transfer',
      triggers: ['t', 'transfer'],
      description: 'Transfer to a different server',
      usage: '<ip> <port>',
    })
  }

  public async execute({ trigger, args, sender }: ICommandExecute): Promise<void> {
    if(args.length !== 1) {
      return sender.sendMessage(this.getUsage(trigger))
    }

    const [ serverType ] = args

    sender.client.ezTransfer(serverType)
  }

}

import { ICommandExecute } from '../../types/commands'
