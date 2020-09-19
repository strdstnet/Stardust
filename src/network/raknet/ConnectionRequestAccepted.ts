import { BundledPacket } from './BundledPacket'
import { Packets, Protocol } from '../../types/protocol'
import { DataType } from '../../types/data'
import { IAddress } from '../../types/network'
import { ParserType } from '../Packet'

interface IConnectionRequestAccepted {
  address: IAddress,
  systemIndex: number,
  systemAddresses: IAddress[],
  requestTime: bigint,
  time: bigint,
}

export class ConnectionRequestAccepted extends BundledPacket<IConnectionRequestAccepted> {

  constructor(p?: IConnectionRequestAccepted) {
    super(Packets.CONNECTION_REQUEST_ACCEPTED, [
      { name: 'address', parser: DataType.ADDRESS },
      { name: 'systemIndex', parser: DataType.SHORT },
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            props.systemAddresses = []
            for(let i = 0; i < Protocol.SYSTEM_ADDRESSES; i++) {
              props.systemAddresses.push(data.readAddress())
            }
          } else {
            for(const address of props.systemAddresses) {
              data.writeAddress(address)
            }
          }
        },
      },
      { name: 'requestTime', parser: DataType.LONG },
      { name: 'time', parser: DataType.LONG },
    ])

    if(p) this.props = Object.assign({}, BundledPacket.defaultProps, p)
  }

}
