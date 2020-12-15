import { ArgType, Gamemode } from '@strdstnet/protocol'
import { Player } from '../../Player'
import { ICommandExecute } from '../../types/commands'
import { Command } from '../Command'
import { InvalidExecutor } from '../errors'

export class SetGamemode extends Command {

  constructor() {
    super({
      name: 'Gamemode',
      trigger: 'gamemode',
      description: 'Sets a player\'s game mode',
      args: [
        { name: 'gameMode', type: ArgType.INT, optional: false },
        { name: 'player', type: ArgType.TARGET, optional: true },
      ],
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    if(!(executor instanceof Player)) throw new InvalidExecutor()
    // TODO: Support mentions?

    if(args.length !== 1) {
      return executor.sendMessage(this.usage)
    }

    const [ gameMode, target ] = args
    executor.setGamemode(gameMode as unknown as Gamemode)
    executor.sendMessage(`Set own gamemode to ${gameMode}`)
  }

}
