import { BundledPacket, BPacketOpt } from '../raknet/BundledPacket'
import { Packets, DataType } from '../../types'

export interface IConnectedPing {
  time: bigint,
}

export class ConnectedPing extends BundledPacket<IConnectedPing> {

  constructor(p?: BPacketOpt<IConnectedPing>) {
    super(Packets.CONNECTED_PING, [
      { name: 'time', parser: DataType.LONG },
    ])

    if(p) this.props = Object.assign({}, BundledPacket.defaultProps, p)
  }

}
