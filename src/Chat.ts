import { TextType } from './network/bedrock/Text'
import { IPlayer } from './types/player'
import { IServer } from './types/server'

export const ChatColour = {
  YELLOW: '§e',
}

export class Chat {

  public static i: Chat

  constructor(private server: IServer) {
    Chat.i = this
  }

  public broadcastPlayerJoined(player: IPlayer): void {
    this.broadcast(`${ChatColour.YELLOW}%multiplayer.player.joined`, player.XUID, TextType.TRANSLATION, [player.username])
  }

  public playerChat(sender: IPlayer, message: string): void {
    this.broadcast(`${sender.username}: ${message}`, sender.XUID, TextType.RAW)
  }

  private broadcast(message: string, xuid: string, type: TextType, parameters: string[] = []): void {
    for(const [, player ] of this.server.players) {
      player.sendMessage(message, xuid, type, parameters)
      console.log(xuid)
    }
  }

}