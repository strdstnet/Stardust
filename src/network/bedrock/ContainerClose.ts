import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IContainerClose {
  windowId: number,
}

export class ContainerClose extends BatchedPacket<IContainerClose> {

  constructor(p?: IContainerClose) {
    super(Packets.CONTAINER_CLOSE, [
      { name: 'windowId', parser: DataType.BYTE },
    ])

    if(p) this.props = p
  }

}
