import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Vector3 } from 'math3d'

export enum MoveEntityMode {
  GROUND = 1,
  TELEPORT = 2,
  FORCE_LOCAL = 3,
}

interface IMoveEntity {
  runtimeEntityId: bigint,
  mode?: MoveEntityMode,
  position: Vector3,
}

export class MoveEntity extends BatchedPacket<IMoveEntity> {
  constructor(p?: Partial<IMoveEntity>) {
    super(Packets.MOVE_ENTITY, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'mode', parser: DataType.BYTE, resolve: () => MoveEntityMode.GROUND },
      { name: 'position', parser: DataType.VECTOR3 },
      { name: 'rotX', parser: DataType.BYTE_ROTATION, resolve: () => 0 },
      { name: 'rotY', parser: DataType.BYTE_ROTATION, resolve: () => 0 },
      { name: 'rotZ', parser: DataType.BYTE_ROTATION, resolve: () => 0 },
    ])

    if(p) this.props = p as IMoveEntity
  }
}
