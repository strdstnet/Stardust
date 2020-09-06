import { Packets } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'
import { BedrockData } from '../../data/BedrockData'
import { Player } from '../../Player'

export enum PlayerListType {
  ADD = 0,
  REMOVE = 1,
}

interface IPlayerList {
  type: PlayerListType,
  players: Player[],
}

export class PlayerList extends BatchedPacket<IPlayerList> {

  constructor(p?: IPlayerList) {
    super(Packets.PLAYER_LIST, [
      {
        parser({ type, data, props, value }) {
          if(type === ParserType.ENCODE) {
            data.writeByte(props.type)
            data.writeByte(props.players.length)

            if(props.type === PlayerListType.ADD) {
              for(const player of props.players) {
                data.writeUUID(player.UUID)
                data.writeVarLong(player.id)
                data.writeString(player.username)
                data.writeString(player.XUID)
                data.writeString('') // platformChatId
                data.writeLInt(-1) // Build platform
                data.writeSkin($entry->skinData)
                data.writeBoolean(false) // isTeacher
                data.writeBoolean(false) // isHost
              }
            } else {
              props.players.forEach(pl => data.writeUUID(pl.UUID))
            }
          } else {
            // TODO: Decode
          }
        },
        resolve: () => BedrockData.BIOME_DEFINITIONS,
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
