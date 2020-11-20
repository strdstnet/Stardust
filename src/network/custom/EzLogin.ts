import { DataType } from '../../types/data'
import { IAddress } from '../../types/network'
import { Packets } from '../../types/protocol'
import { BinaryData } from '../../utils/BinaryData'
import { Packet } from '../Packet'

interface IEzLogin {
  address: IAddress,
  mtuSize: number,
  clientId: bigint,
  sequenceNumber: number,
  loginData: BinaryData,
}

export class EzLogin extends Packet<IEzLogin> {

  constructor() {
    super(Packets.EZ_LOGIN, [
      { name: 'address', parser: DataType.ADDRESS },
      { name: 'mtuSize', parser: DataType.SHORT },
      { name: 'clientId', parser: DataType.LONG },
      { name: 'sequenceNumber', parser: DataType.L_TRIAD },
      { name: 'loginData', parser: DataType.BYTE_ARRAY },
    ])
  }

}
