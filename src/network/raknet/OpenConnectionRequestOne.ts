import { Packet, ParserType } from '../Packet'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

export interface IOpenConnectionRequestOne {
  protocol: number,
  mtuSize: number,
}

export class OpenConnectionRequestOne extends Packet<IOpenConnectionRequestOne> {

  constructor(p?: IOpenConnectionRequestOne) {
    super(Packets.OPEN_CONNECTION_REQUEST_ONE, [
      { parser: DataType.MAGIC },
      { name: 'protocol', parser: DataType.BYTE },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeBytes(0x00, props.mtuSize)
          } else {
            props.mtuSize = data.length - 17
          }
        },
      },
    ])

    if(p) this.props = p
  }

}
