import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BatchedPacket } from './BatchedPacket'

export class ItemComponent extends BatchedPacket<{}> {

  constructor() {
    super(Packets.ITEM_COMPONENT, [
      { name: 'idfk', parser: DataType.U_VARINT, resolve: () => 0 },
    ])
  }

}
