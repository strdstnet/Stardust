import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BundledPacket } from './BundledPacket'

export interface IConnectionRequest {
  clientId: bigint,
  sendPingTime: bigint,
  hasSecurity: boolean,
}

export class ConnectionRequest extends BundledPacket<IConnectionRequest> {

  constructor(p?: IConnectionRequest) {
    super(Packets.CONNECTION_REQUEST, [
      { name: 'clientId', parser: DataType.LONG },
      { name: 'sendPingTime', parser: DataType.LONG },
      { name: 'hasSecurity', parser: DataType.BOOLEAN },
    ])

    if(p) this.props = Object.assign({}, BundledPacket.defaultProps, p)
  }

}
