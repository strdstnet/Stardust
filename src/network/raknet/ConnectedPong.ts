import { BundledPacket } from './BundledPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IConnectedPong {
  pingTime: bigint,
  pongTime: bigint,
}

export class ConnectedPong extends BundledPacket<IConnectedPong> {

  constructor(p?: IConnectedPong) {
    super(Packets.CONNECTED_PONG, [
      { name: 'pingTime', parser: DataType.LONG },
      { name: 'pongTime', parser: DataType.LONG },
    ])

    if(p) this.props = Object.assign({}, BundledPacket.defaultProps, p)
  }

}
