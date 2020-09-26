import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'
import { ContainerActionSource, ContainerTransactionType } from '../../types/containers'
import { Item } from '../../item/Item'
import { Vector3 } from 'math3d'
import { BatchedPacket } from './BatchedPacket'

interface ITransaction {
  type: number,
  position: Vector3,
  face?: number,
  hotbarSlot: number,
  itemHolding: Item,
  playerPos?: Vector3
  clickPos?: Vector3,
  blockRuntimeId?: number,
  entityRuntimeId?: bigint,
  headPos?: Vector3
}

interface IContainerAction {
  sourceType: ContainerActionSource,
  containerId: number,
  sourceFlags?: number,
  slot: number,
  oldItem: Item,
  newItem: Item
  newItemStackId?: number,
}

interface IChangedSlots {
  containerId: number,
  indexes: number[],
}

interface IContainerTransaction {
  requestId: number,
  requestChangedSlots: IChangedSlots[],
  transactionType: number,
  hasItemStackIds: boolean,
  actions: IContainerAction[],
  transaction: ITransaction,
}

export class ContainerTransaction extends BatchedPacket<IContainerTransaction> {

  constructor(props?: IContainerTransaction) {
    super(Packets.CONTAINER_TRANSACTION, [
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
                const containerId = data.readByte()

                const count2 = data.readUnsignedVarInt()
                const indexes = []

                for(let i2 = 0; i2 < count2; i2++) {
                  indexes.push(data.readByte())
                }

                props.requestChangedSlots.push({ containerId, indexes })
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
              data.writeUnsignedVarInt(action.slot)
              data.writeContainerItem(action.oldItem)
              data.writeContainerItem(action.newItem)
              if(props.hasItemStackIds && action.newItemStackId) {
                data.writeVarInt(action.newItemStackId)
              }
            }
          } else {
            props.actions = []
            const count = data.readUnsignedVarInt()

            for(let i = 0; i < count; i++) {
              const action: IContainerAction = {} as IContainerAction
              action.sourceType = data.readUnsignedVarInt()

              switch(action.sourceType) {
                case ContainerActionSource.CONTAINER:
                case ContainerActionSource.CLIENT:
                  action.containerId = data.readVarInt()
                  break
                case ContainerActionSource.WORLD:
                  action.sourceFlags = data.readUnsignedVarInt()
                  break
                case ContainerActionSource.CREATIVE:
                  break
                default:
                  throw new Error(`Unknown inventory source type ${action.sourceType}`)
              }

              action.slot = data.readUnsignedVarInt()
              action.oldItem = data.readContainerItem()
              action.newItem = data.readContainerItem()

              if(props.hasItemStackIds) {
                action.newItemStackId = data.readVarInt()
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
                data.writeContainerItem(useItem.itemHolding)
                data.writeVector3(useItem.playerPos)
                data.writeVector3(useItem.clickPos)
                data.writeUnsignedVarInt(useItem.blockRuntimeId)
                break
              case ContainerTransactionType.USE_ITEM_ON_ENTITY:
                const useItemEntity = props.transaction as any
                data.writeUnsignedVarLong(useItemEntity.entityRuntimeId)
                data.writeUnsignedVarInt(useItemEntity.type)
                data.writeVarInt(useItemEntity.hotbarSlot)
                data.writeContainerItem(useItemEntity.itemHolding)
                data.writeVector3(useItemEntity.playerPos)
                data.writeVector3(useItemEntity.clickPos)
                break
              case ContainerTransactionType.RELEASE_ITEM:
                const itemRelease = props.transaction as any
                data.writeUnsignedVarInt(itemRelease.type)
                data.writeVarInt(itemRelease.hotbarSlot)
                data.writeContainerItem(itemRelease.itemHolding)
                data.writeVector3(itemRelease.headPos)
                break
              case ContainerTransactionType.NORMAL:
              case ContainerTransactionType.MISMATCH:
                break
              default:
                throw new Error(`Unknown transaction type ${props.transactionType}`)
            }
          } else {
            switch(props.transactionType) {
              case ContainerTransactionType.USE_ITEM:
                props.transaction = {
                  type: data.readUnsignedVarInt(),
                  position: new Vector3(
                    data.readVarInt(),
                    data.readUnsignedVarInt(),
                    data.readVarInt(),
                  ),
                  face: data.readVarInt(),
                  hotbarSlot: data.readVarInt(),
                  itemHolding: data.readContainerItem(),
                  playerPos: data.readVector3(),
                  clickPos: data.readVector3(),
                  blockRuntimeId: data.readUnsignedVarInt(),
                }
                break
              case ContainerTransactionType.USE_ITEM_ON_ENTITY:
                props.transaction = {
                  entityRuntimeId: data.readUnsignedVarLong(),
                  type: data.readUnsignedVarInt(),
                  hotbarSlot: data.readVarInt(),
                  itemHolding: data.readContainerItem(),
                  playerPos: data.readVector3(),
                  clickPos: data.readVector3(),
                  position: new Vector3(0, 0, 0),
                }
                break
              case ContainerTransactionType.RELEASE_ITEM:
                props.transaction = {
                  type: data.readUnsignedVarInt(),
                  hotbarSlot: data.readVarInt(),
                  itemHolding: data.readContainerItem(),
                  headPos: data.readVector3(),
                  position: new Vector3(0, 0, 0),
                }
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

    if(props) this.props = Object.assign({}, props)
  }

}
