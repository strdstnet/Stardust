import { BatchedPacket } from './BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface IEntityFall {
  runtimeEntityId: bigint,
  fallDistance: number,
  isInVoid: boolean,
}

export class EntityFall extends BatchedPacket<IEntityFall> {

  constructor(p?: IEntityFall) {
    super(Packets.ENTITY_FALL, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'fallDistance', parser: DataType.L_FLOAT },
      { name: 'isInVoid', parser: DataType.BOOLEAN },
    ])

    if(p) this.props = p
  }

}
