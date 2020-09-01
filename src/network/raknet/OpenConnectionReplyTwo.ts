import { Packet } from '../Packet'
import { Packets, DataType, Protocol, IAddress } from '../../types'

export interface IOpenConnectionReplyTwo {
  address: IAddress,
  mtuSize: number,
}

export class OpenConnectionReplyTwo extends Packet<IOpenConnectionReplyTwo> {

  constructor(p?: IOpenConnectionReplyTwo) {
    super(Packets.OPEN_CONNECTION_REPLY_TWO, [
      { parser: DataType.MAGIC },
      { parser: DataType.LONG, resolve: () => Protocol.SERVER_ID },
      { name: 'address', parser: DataType.ADDRESS },
      { name: 'mtuSize', parser: DataType.SHORT },
      { parser: DataType.BYTE, resolve: () => 0 },
    ])

    if(p) this.props = p
  }

}
