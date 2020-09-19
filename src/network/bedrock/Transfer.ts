import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

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
