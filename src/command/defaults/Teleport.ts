import { Command } from '../Command'

export class Teleport extends Command {

  constructor() {
    super({
      name: 'Teleport',
      triggers: ['tp', 'teleport'],
      description: 'Teleport to a player or a set of coordinates',
      usage: '',
    })
  }

  public async execute({ trigger, args, sender }: ICommandExecute): Promise<void> {
    // TODO: Support mentions?

    if(args.length !== 3) {
      return sender.sendMessage(this.getUsage(trigger))
    }

    const [ x, y, z ] = args
    sender.teleport(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10))
    sender.sendMessage(`Teleported to (${x}, ${y}, ${z})`)
  }

}

import { ICommandExecute } from '../../types/commands'
