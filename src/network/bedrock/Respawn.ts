import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { RespawnState } from '../../types/world'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Vector3 } from 'math3d'

interface IRespawn {
  position: Vector3,
  state: RespawnState,
  entityRuntimeId: bigint,
}

export class Respawn extends BatchedPacket<IRespawn> {

  constructor(p?: IRespawn) {
    super(Packets.RESPAWN, [
      { name: 'position', parser: DataType.VECTOR3 },
      { name: 'state', parser: DataType.BYTE },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
