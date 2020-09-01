import { Packet } from '../Packet'
import { Packets, DataType, Protocol } from '../../types'

export interface IOpenConnectionReplyOne {
  mtuSize: number,
}

export class OpenConnectionReplyOne extends Packet<IOpenConnectionReplyOne> {

  constructor(p?: IOpenConnectionReplyOne) {
    super(Packets.OPEN_CONNECTION_REPLY_ONE, [
      { parser: DataType.MAGIC },
      { parser: DataType.LONG, resolve: () => Protocol.SERVER_ID },
      { parser: DataType.BYTE, resolve: () => 0 },
      { name: 'mtuSize', parser: DataType.SHORT },
    ])

    if(p) this.props = p
  }

}
