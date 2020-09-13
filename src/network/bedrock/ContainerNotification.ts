import { Packets, DataType, ContainerType } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { ParserType } from '../Packet'
import { Item } from '../../item/Item'

interface IContainerNotification {
  type: ContainerType,
  items: Item[],
}

export class ContainerNotification extends BatchedPacket<IContainerNotification> {

  constructor(p?: IContainerNotification) {
    super(Packets.CONTAINER_NOTIFICATION, [
      { name: 'type', parser: DataType.U_VARINT },
      {
        name: 'items',
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.items.length)

            for(const item of props.items) {
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
