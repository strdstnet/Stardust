import { BundledPacket } from '../raknet/BundledPacket'
import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'

interface ISetTime {
  time: number,
}

export class SetTime extends BatchedPacket<ISetTime> {

  constructor(props?: ISetTime) {
    super(Packets.SET_TIME, [
      { name: 'time', parser: DataType.VARINT },
    ])

    if(props) this.props = Object.assign({}, BundledPacket.defaultProps, props)
  }

}
