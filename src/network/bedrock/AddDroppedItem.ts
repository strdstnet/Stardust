import { DroppedItem } from '../../entity/DroppedItem'
import { EntityPosition } from '../../entity/EntityPosition'
import { Metadata } from '../../entity/Metadata'
import { Item } from '../../item/Item'
import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'

interface IAddDroppedItem {
  entityRuntimeId: bigint,
  entityUniqueId: bigint,
  item: Item,
  position: EntityPosition,
  metadata: Metadata,
  fromFishing: boolean
}

export class AddDroppedItem extends BatchedPacket<IAddDroppedItem> {

  constructor(item: DroppedItem) {
    super(Packets.ADD_DROPPED_ITEM, [
      { name: 'entityUniqueId', parser: DataType.VARLONG, resolve: props => props.entityUniqueId || props.entityRuntimeId },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'item', parser: DataType.CONTAINER_ITEM },
      {
        parser({ type, props, data }) {
          if(type === ParserType.ENCODE) {
            data.writeVector3(props.position.coords)
            data.writeVector3(props.position.motion)
          }
        },
      },
      { name: 'metadata', parser: DataType.ENTITY_METADATA },
      { name: 'fromFishing', parser: DataType.BOOLEAN },
    ])
    this.props = {
      entityUniqueId: item.id,
      entityRuntimeId: item.id,
      item: item.item,
      position: item.position,
      metadata: item.metadata,
      fromFishing: false, // TODO:
    }
  }

}
