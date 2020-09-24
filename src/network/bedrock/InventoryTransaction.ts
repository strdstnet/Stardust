import { BundledPacket } from '../raknet/BundledPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'
import { ContainerActionSource, ContainerTransactionType } from '../../types/containers'
import { Item } from '../../item/Item'
import { Vector3 } from 'math3d'
import { EntityPosition } from '../../entity/EntityPosition'

interface ITransaction {
  type: number,
  position?: Vector3,
  face?: number,
  hotbarSlot: number,
  itemInHand: Item,
  playerPos?: EntityPosition
  clickPos?: Vector3,
  blockRuntimeId?: number,
  entityRuntimeId?: bigint,
  headPos?: Vector3
}

interface IInventoryAction {
  sourceType: ContainerActionSource,
  containerId: number,
  sourceFlags?: number,
  inventorySlot: number,
  oldItem: Item,
  newItem: Item
  newItemStackId?: number,
}

interface IChangedSlots {
  containerId: number,
  indexes: number[],
}

interface IInventoryTransaction {
  requestId: number,
  requestChangedSlots: IChangedSlots[],
  transactionType: number,
  hasItemStackIds: boolean,
  actions: IInventoryAction[],
  transaction: ITransaction,
}

export class InventoryTransaction extends BundledPacket<IInventoryTransaction> {

  constructor(props?: IInventoryTransaction) {
    super(Packets.INVENTORY_TRANSACTION, [
      { name: 'requestId', parser: DataType.VARINT },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            if(props.requestId !== 0) {
              data.writeUnsignedVarInt(props.requestChangedSlots.length)
              for(const { containerId, indexes } of props.requestChangedSlots) {
                data.writeByte(containerId)
                data.writeUnsignedVarInt(indexes.length)
                indexes.forEach(i => data.writeByte(i))
              }
            }
          } else {
            props.requestChangedSlots = []
            if(props.requestId !== 0) {
              const count = data.readUnsignedVarInt()
              for(let i = 0; i < count; i++) {
                props.requestChangedSlots.push({
                  containerId: data.readByte(),
                })
              }
            }
          }
        },
      },
      { name: 'transactionType', parser: DataType.U_VARINT },
      { name: 'hasItemStackIds', parser: DataType.BOOLEAN },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.actions.length)
            for(const action of props.actions) {
              data.writeUnsignedVarInt(action.sourceType)
              switch(action.sourceType) {
                case ContainerActionSource.CONTAINER:
                case ContainerActionSource.CLIENT:
                  data.writeVarInt(action.containerId)
                  break
                case ContainerActionSource.WORLD:
                  data.writeUnsignedVarInt(action.sourceFlags || 0)
                  break
                case ContainerActionSource.CREATIVE:
                  break
                default:
                  throw new Error(`Unknown inventory source type ${action.sourceType}`)
              }
              data.writeUnsignedVarInt(action.inventorySlot)
              data.writeContainerItem(action.oldItem)
              data.writeContainerItem(action.newItem)
              if(props.hasItemStackIds && action.newItemStackId) {
                data.writeVarInt(action.newItemStackId)
              }
            }
          }
        },
      },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            switch(props.transactionType) {
              case ContainerTransactionType.USE_ITEM:
                const useItem = props.transaction as any
                data.writeUnsignedVarInt(useItem.type)
                data.writeVarInt(useItem.position.x)
                data.writeUnsignedVarInt(useItem.position.y)
                data.writeVarInt(useItem.position.z)
                data.writeVarInt(useItem.face)
                data.writeVarInt(useItem.hotbarSlot)
                data.writeContainerItem(useItem.itemInHand)
                data.writeVector3(useItem.playerPos)
                data.writeVector3(useItem.clickPos)
                data.writeUnsignedVarInt(useItem.blockRuntimeId)
                break
              case ContainerTransactionType.USE_ITEM_ON_ENTITY:
                const useItemEntity = props.transaction as any
                data.writeUnsignedVarLong(useItemEntity.entityRuntimeId)
                data.writeUnsignedVarInt(useItemEntity.type)
                data.writeVarInt(useItemEntity.hotbarSlot)
                data.writeContainerItem(useItemEntity.itemInHand)
                data.writeVector3(useItemEntity.playerPos)
                data.writeVector3(useItemEntity.clickPos)
                break
              case ContainerTransactionType.RELEASE_ITEM:
                const itemRelease = props.transaction as any
                data.writeUnsignedVarInt(itemRelease.type)
                data.writeVarInt(itemRelease.hotbarSlot)
                data.writeContainerItem(itemRelease.itemInHand)
                data.writeVector3(itemRelease.headPos)
                break
              case ContainerTransactionType.NORMAL:
              case ContainerTransactionType.MISMATCH:
                break
              default:
                throw new Error(`Unknown transaction type ${props.transactionType}`)
            }
          }
        },
      },
    ])

    if(props) this.props = Object.assign({}, BundledPacket.defaultProps, props)
  }

}
