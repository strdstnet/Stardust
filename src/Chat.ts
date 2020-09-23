import { TextType } from './network/bedrock/Text'
import { IPlayer } from './types/player'
import { IServer } from './types/server'

const ESCAPE = '\xc2\xa7'
export const ChatColour = {
  // YELLOW: `${ESCAPE}e`,
  YELLOW: '§e',
}

export class Chat {

  public static i: Chat

  constructor(private server: IServer) {
    Chat.i = this
  }

  public broadcastPlayerJoined(player: IPlayer): void {
    this.broadcast('%multiplayer.player.joined', TextType.TRANSLATION, [player.username])
  }

  public playerChat(sender: IPlayer, message: string): void {
    this.broadcast(`${sender.username}: ${message}`, TextType.RAW)
  }

  private broadcast(message: string, type: TextType, parameters: string[] = []): void {
    for(const [, player ] of this.server.players) {
      player.sendMessage(message, type, parameters)
    }
  }

}