import { Packet } from '../Packet'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { IAddress } from '../../types/network'

export interface IOpenConnectionRequestTwo {
  address: IAddress,
  mtuSize: number,
  clientId: bigint,
}

export class OpenConnectionRequestTwo extends Packet<IOpenConnectionRequestTwo> {

  constructor(p?: IOpenConnectionRequestTwo) {
    super(Packets.OPEN_CONNECTION_REQUEST_TWO, [
      { parser: DataType.MAGIC },
      { name: 'address', parser: DataType.ADDRESS },
      { name: 'mtuSize', parser: DataType.SHORT },
      { name: 'clientId', parser: DataType.LONG },
    ])

    if(p) this.props = p
  }

}
