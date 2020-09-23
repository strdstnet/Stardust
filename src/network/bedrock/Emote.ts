import { BatchedPacket } from './BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IEmote {
  runtimeEntityId: bigint,
  emoteId: string,
  flags: number,
}

export class Emote extends BatchedPacket<IEmote> {

  constructor(p?: IEmote) {
    super(Packets.EMOTE, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'emoteId', parser: DataType.STRING },
      { name: 'flags', parser: DataType.BYTE },
    ])

    if(p) this.props = p
  }

}
