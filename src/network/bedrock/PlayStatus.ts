import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { PlayStatusType } from '../../types/world'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IPlayStatus {
  status: PlayStatusType,
}

export class PlayStatus extends BatchedPacket<IPlayStatus> {

  constructor(p?: IPlayStatus) {
    super(Packets.PLAY_STATUS, [
      { name: 'status', parser: DataType.INT },
      // {
      //   parser({ type, data }) {
      //     if(type === ParserType.ENCODE) {
      //       const arr = []
      //       for(let i = 0; i < Protocol.DEFAULT_MTU * 2; i++) {
      //         arr[i] = String.fromCharCode(i)
      //       }
      //       data.writeString(arr.join(''))
      //     }
      //   },
      // },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
