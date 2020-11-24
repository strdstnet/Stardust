import chalk from 'chalk'
import { TextType } from './network/bedrock/Text'
import { IPlayer, DamageCause } from './types/player'
import { IServer } from './types/server'

/** @deprecated use Chat.ChatFormat instead */
export const ChatColour = {
  YELLOW: '§e',
}

export enum ChatFormat {
  RED = '§c',
  LIGHT_PURPLE = '§d',
  YELLOW = '§e',

  RESET = '§r',
}

export class Chat {

  public static i: Chat

  constructor(private server: IServer) {
    Chat.i = this
  }

  public broadcastPlayerJoined(player: IPlayer): void {
    this.broadcast(`${ChatFormat.YELLOW}%multiplayer.player.joined`, TextType.TRANSLATION, [player.username])
  }

  public playerChat(sender: IPlayer, message: string): void {
    this.broadcast(`${sender.username}: ${message}`, TextType.RAW)
  }

  private broadcast(message: string, type: TextType, parameters: string[] = []): void {
    for(const [, player ] of this.server.players) {
      player.sendMessage(message, type, parameters)
    }
  }

  public playerDied(cause: DamageCause = DamageCause.GENERIC, args: string[]): void {
    this.broadcast(`${ChatFormat.YELLOW}%${cause}`, TextType.TRANSLATION, args)
  }

  public say(speaker: string, message: string): void {
    const msg = `[${speaker}] ${message}`
    this.broadcast(`${ChatFormat.LIGHT_PURPLE}${msg}`, TextType.RAW)

    console.log(chalk.magentaBright(msg))
  }

}