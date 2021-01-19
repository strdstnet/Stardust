import { ArgType, Gamemode as GM } from '@strdstnet/protocol'
import { Player } from '../../Player'
import { Server } from '../../Server'
import { ICommandExecute } from '../../types/commands'
import { Command } from '../Command'

export class Gamemode extends Command {

  constructor() {
    super({
      name: 'gamemode',
      description: 'Sets a player\'s game mode',
      args: [
        { name: 'gameMode', type: ArgType.INT, optional: false },
        { name: 'player', type: ArgType.TARGET, optional: true },
      ],
      consoleArgs: [
        { name: 'gameMode', type: ArgType.INT, optional: false },
        { name: 'player', type: ArgType.TARGET, optional: false },
      ],
    })
  }

  public async execute({ args, executor }: ICommandExecute): Promise<void> {
    if(!this.validate({ args, executor })) {
      executor.sendMessage(this.getUsage(executor))
      return
    }

    const [ gameMode, target ] = args
    const gm = parseInt(gameMode, 10)

    if(target) {
      const player = Server.i.getPlayerByUsername(target)

      if(player) {
        player.setGamemode(gm as GM)
        executor.sendMessage(`Set gamemode to ${gameMode} for ${player.username}`)
      } else {
        executor.sendMessage('Player not found')
      }
    } else if(executor instanceof Player) {
      executor.setGamemode(gm as GM)
      executor.sendMessage(`Set own gamemode to ${gameMode}`)
    }
  }

}
