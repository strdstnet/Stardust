import { Item } from '../../item/Item'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IEntityEquipment {
  entityRuntimeId: bigint,
  item: Item,
  inventorySlot: number,
  hotbarSlot: number,
  containerId: number,
}

export class EntityEquipment extends BatchedPacket<IEntityEquipment> {

  constructor(p?: Partial<IEntityEquipment>) {
    super(Packets.ENTITY_EQUIPMENT, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'item', parser: DataType.CONTAINER_ITEM },
      { name: 'inventorySlot', parser: DataType.BYTE },
      { name: 'hotbarSlot', parser: DataType.BYTE },
      { name: 'containerId', parser: DataType.BYTE },
    ])

    if(p) this.props = Object.assign({}, p as IEntityEquipment)
  }

}
