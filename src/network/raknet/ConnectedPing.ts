import { BundledPacket, BPacketOpt } from './BundledPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

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
