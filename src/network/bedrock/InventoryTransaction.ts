import { BundledPacket } from '../raknet/BundledPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'

interface IInventoryTransaction {
  requestId: number,
  requestChangedSlots: string,
  transactionType: number,
  hasItemStackIds: boolean,
  actions: string,
  trData: string,
}

export class InventoryTransaction extends BundledPacket<IInventoryTransaction> {

  constructor(props?: IInventoryTransaction) {
    super(Packets.INVENTORY_TRANSACTION, [
      { name: 'requestId', parser: DataType.VARINT },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            if(props.requestId) {
              //
            }
          }
        },
      },
    ])

    if(props) this.props = Object.assign({}, BundledPacket.defaultProps, props)
  }

}
