import { Packet } from '../Packet'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

export interface IUnconnectedPing {
  pingId: bigint,
  clientId: bigint,
}

export class UnconnectedPing extends Packet<IUnconnectedPing> {

  constructor(p?: IUnconnectedPing) {
    super(Packets.UNCONNECTED_PING, [
      { name: 'pingId', parser: DataType.LONG },
      { name: 'magic', parser: DataType.MAGIC },
      { name: 'clientId', parser: DataType.LONG },
    ])

    if(p) this.props = p
  }

}
