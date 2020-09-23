import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'

interface IAnimate {
  action: number,
  entityRuntimeId: bigint,
  boatRowingTime?: number
}

export class Animate extends BatchedPacket<IAnimate> {

  constructor(p?: IAnimate) {
    super(Packets.ANIMATE, [
      { name: 'action', parser: DataType.VARINT },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            if((props.action & 0x80) !== 0) {
              data.writeLFloat(props.boatRowingTime || 0)
            }
          } else {
            if((props.action & 0x80) !== 0) {
              props.boatRowingTime = data.readLFloat()
            }
          }
        },
      },
    ])

    if(p) this.props = p
  }

}
