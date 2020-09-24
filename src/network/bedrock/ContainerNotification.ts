import { Packets } from '../../types/protocol'
import { ContainerId } from '../../types/containers'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'
import { Item } from '../../item/Item'

interface IContainerNotification {
  containerId: ContainerId,
  items: Item[],
}

export class ContainerNotification extends BatchedPacket<IContainerNotification> {

  constructor(p?: IContainerNotification) {
    super(Packets.CONTAINER_NOTIFICATION, [
      { name: 'containerId', parser: DataType.U_VARINT },
      {
        name: 'items',
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.items.length)

            for(const item of props.items) {
              data.writeVarInt(0)
              data.writeContainerItem(item)
            }
          } else {
            // TODO: DECODE
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
