import { Packets, DataType, RespawnState } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { Vector3 } from 'math3d'

interface IRespawn {
  position: Vector3,
  state: RespawnState,
  entityId: bigint,
}

export class Respawn extends BatchedPacket<IRespawn> {

  constructor(p?: IRespawn) {
    super(Packets.RESPAWN, [
      { name: 'position', parser: DataType.VECTOR3 },
      { name: 'state', parser: DataType.BYTE },
      { name: 'entityId', parser: DataType.U_VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
