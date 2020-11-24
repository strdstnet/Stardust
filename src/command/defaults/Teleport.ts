import { Player } from '../../Player'
import { ICommandExecute, ArgType } from '../../types/commands'
import { Command } from '../Command'
import { InvalidExecutor } from '../errors'

export class Teleport extends Command {

  constructor() {
    super({
      name: 'Teleport',
      trigger: 'tp',
      description: 'Teleport to a player or a set of coordinates',
      usage: '',
      args: [
        { name: 'x', type: ArgType.INT, optional: false },
        { name: 'y', type: ArgType.INT, optional: false },
        { name: 'z', type: ArgType.INT, optional: false },
        // { name: 'position', type: ArgType.POSITION, optional: false },
      ],
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    if(!(executor instanceof Player)) throw new InvalidExecutor()
    // TODO: Support mentions?

    if(args.length !== 3) {
      return executor.sendMessage(this.usage)
    }

    const [ x, y, z ] = args
    executor.teleport(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10))
    executor.sendMessage(`Teleported to (${x}, ${y}, ${z})`)
  }

}
