import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'

interface ITickSync {
  clientRequestTimestamp: bigint,
  serverReceptionTimestamp: bigint,
}

export class TickSync extends BatchedPacket<ITickSync> {

  constructor(p?: ITickSync) {
    super(Packets.TICK_SYNC, [
      { name: 'clientRequestTimestamp', parser: DataType.L_LONG },
      { name: 'serverReceptionTimestamp', parser: DataType.L_LONG },
    ])

    if(p) this.props = p
  }

}
