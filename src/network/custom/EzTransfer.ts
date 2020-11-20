import { ServerType } from '../../API'
import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BinaryData } from '../../utils/BinaryData'
import { Packet } from '../Packet'

interface IEzTransfer {
  serverType: ServerType,
  clientId: bigint,
  sequenceNumber: number,
  loginData: BinaryData,
}

export class EzTransfer extends Packet<IEzTransfer> {

  constructor(public props: IEzTransfer) {
    super(Packets.EZ_TRANSFER, [
      { name: 'serverType', parser: DataType.STRING },
      { name: 'clientId', parser: DataType.LONG },
      { name: 'sequenceNumber', parser: DataType.L_TRIAD },
      { name: 'loginData', parser: DataType.BYTE_ARRAY },
    ])
  }

}
