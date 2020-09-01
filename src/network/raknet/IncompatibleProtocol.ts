import { Packet } from '../Packet'
import { Packets, DataType, Protocol } from '../../types'

interface IIncompatibleProtocol {
  protocol: number,
  serverId: bigint,
}

export class IncompatibleProtocol extends Packet<IIncompatibleProtocol> {

  constructor(p?: IIncompatibleProtocol) {
    super(Packets.INCOMPATIBLE_PROTOCOL, [
      { name: 'protocol', parser: DataType.BYTE, resolve: () => Protocol.PROTOCOL_VERSION },
      { name: 'magic', parser: DataType.MAGIC },
      { name: 'serverId', parser: DataType.LONG, resolve: () => Protocol.SERVER_ID },
    ])

    if(p) this.props = p
  }

}
