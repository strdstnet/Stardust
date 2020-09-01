import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'

export interface ITransfer {
  address: string,
  port: number,
}

export class Transfer extends BatchedPacket<ITransfer> {

  constructor(props?: ITransfer) {
    super(Packets.TRANSFER, [
      { name: 'address', parser: DataType.STRING },
      { name: 'port', parser: DataType.L_SHORT },
    ])

    if(props) this.props = Object.assign({}, props)
  }

}
