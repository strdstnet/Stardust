import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Vector3 } from 'math3d'

interface ISetEntityMotion {
  runtimeEntityId: bigint,
  motion: Vector3,
}

export class SetEntityMotion extends BatchedPacket<ISetEntityMotion> {

  constructor(p?: ISetEntityMotion) {
    super(Packets.SET_ENTITY_MOTION, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'motion', parser: DataType.VECTOR3 },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
