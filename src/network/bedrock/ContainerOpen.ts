import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IContainerOpen {
  windowId: number,
  containerType: number,
  containerX: number,
  containerY: number,
  containerZ: number,
  containerEntityId: bigint,
}

export class ContainerOpen extends BatchedPacket<IContainerOpen> {

  constructor(p?: IContainerOpen) {
    super(Packets.CONTAINER_OPEN, [
      { name: 'windowId', parser: DataType.BYTE },
      { name: 'containerType', parser: DataType.BYTE },
      { name: 'containerX', parser: DataType.VARINT },
      { name: 'containerY', parser: DataType.U_VARINT },
      { name: 'containerZ', parser: DataType.VARINT },
      { name: 'containerEntityId', parser: DataType.VARLONG },
    ])

    if(p) this.props = p
  }

}
