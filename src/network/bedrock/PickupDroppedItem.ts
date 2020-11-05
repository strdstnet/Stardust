import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IPickupDroppedItem {
  target: bigint,
  runtimeEntityId: bigint,
}

export class PickupDroppedItem extends BatchedPacket<IPickupDroppedItem> {

  constructor(p?: IPickupDroppedItem) {
    super(Packets.PICK_UP_DROPPED_ITEM, [
      { name: 'target', parser: DataType.U_VARINT },
      { name: 'runtimeEntityId', parser: DataType.U_VARINT },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
