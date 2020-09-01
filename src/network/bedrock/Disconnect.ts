import { BundledPacket } from '../raknet/BundledPacket'
import { Packets, DataType } from '../../types'

interface IDisconnect {
  hideScreen: boolean,
  message?: string,
}

export class Disconnect extends BundledPacket<IDisconnect> {

  constructor(props?: IDisconnect) {
    super(Packets.DISCONNECT, [
      { name: 'hideScreen', parser: DataType.BOOLEAN },
      { name: 'message', parser: DataType.STRING },
    ])

    if(props) this.props = Object.assign({}, BundledPacket.defaultProps, props)
  }

}
