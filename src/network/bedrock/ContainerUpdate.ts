import { Packets } from '../../types/protocol'
import { ContainerId } from '../../types/containers'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'
import { Item } from '../../item/Item'

interface IContainerUpdate {
  containerId: ContainerId,
  slot: number,
  item: Item,
}

export class ContainerUpdate extends BatchedPacket<IContainerUpdate> {

  constructor(p?: IContainerUpdate) {
    super(Packets.CONTAINER_UPDATE, [
      { name: 'containerId', parser: DataType.U_VARINT },
      { name: 'slot', parser: DataType.U_VARINT },
      {
        name: 'item',
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeVarInt(props.slot)
            data.writeContainerItem(props.item)
          } else {
            // TODO: DECODE
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
