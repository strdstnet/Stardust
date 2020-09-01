import { BundledPacket } from '../raknet/BundledPacket'
import { Packets, DataType } from '../../types'

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
