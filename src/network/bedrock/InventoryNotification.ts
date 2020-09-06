import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { ParserType } from '../Packet'
import { Item } from '../../item/Item'

interface IInventoryNotification {
  type: number,
  items: Item[],
}

export class InventoryNotification extends BatchedPacket<IInventoryNotification> {

  constructor(p?: IInventoryNotification) {
    super(Packets.INVENTORY_NOTIFICATION, [
      { name: 'type', parser: DataType.U_VARINT },
      {
        name: 'items',
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.items.length)

            for(const item of props.items) {
              data.writeInventoryItem(item)
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
