import { BundledPacket } from '../raknet/BundledPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

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
