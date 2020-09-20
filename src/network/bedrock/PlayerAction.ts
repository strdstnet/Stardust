import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IPlayerAction {
  runtimeEntityId: bigint,
  action: number,
  x: number,
  y: number,
  z: number,
  face: number,
}

export class PlayerAction extends BatchedPacket<IPlayerAction> {

  constructor(p?: IPlayerAction) {
    super(Packets.PLAYER_ACTION, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'action', parser: DataType.VARINT },
      { name: 'x', parser: DataType.VARINT },
      { name: 'y', parser: DataType.U_VARINT },
      { name: 'z', parser: DataType.VARINT },
      { name: 'face', parser: DataType.VARINT },
    ])

    if(p) this.props = p
  }

}
