import { Command } from '../Command'
import { Player } from '../../Player'
import { InvalidExecutor } from '../errors'
import { ICommandExecute } from '../../types/commands'
import { ArgType } from '@strdstnet/protocol'

export class Transfer extends Command {

  constructor() {
    super({
      name: 'Transfer',
      trigger: 'transfer',
      description: 'Transfer to a different server',
      args: [
        { name: 'type', type: ArgType.MESSAGE, optional: false },
      ],
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    if(!(executor instanceof Player)) throw new InvalidExecutor()

    if(args.length !== 1) {
      return executor.sendMessage(this.usage)
    }

    const [ serverType ] = args

    executor.client.ezTransfer(serverType)
  }

}
