import { DataType, Packets } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'

export enum MovePlayerMode {
  NORMAL = 0,
  RESET = 1,
  TELEPORT = 2,
  PITCH = 3,
}

interface IMovePlayer {
  runtimeEntityId: BigInt
  positionX: BigInt
  positionY: BigInt
  positionZ: BigInt
  pitch: BigInt
  yaw: BigInt
  headYaw: BigInt
  mode: MovePlayerMode
  onGround: boolean
  ridingEntityRuntimeId: BigInt
  teleportCause: number
  teleportItemId: number
}

const def = (val: any) => () => val

export class MovePlayer extends BatchedPacket<IMovePlayer> {
  constructor(p?: IMovePlayer) {
    super(Packets.MOVE_PLAYER, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'positionX', parser: DataType.L_FLOAT },
      { name: 'positionY', parser: DataType.L_FLOAT },
      { name: 'positionZ', parser: DataType.L_FLOAT },
      { name: 'pitch', parser: DataType.L_FLOAT },
      { name: 'yaw', parser: DataType.L_FLOAT },
      { name: 'headYaw', parser: DataType.L_FLOAT },
      { name: 'mode', parser: DataType.BYTE, resolve: def(MovePlayerMode.NORMAL) },
      { name: 'onGround', parser: DataType.U_VARLONG },
      { name: 'ridingEntityRuntimeId', parser: DataType.U_VARLONG },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            if(props.mode === MovePlayerMode.TELEPORT) {
              data.writeLInt(props.teleportCause)
              data.writeLInt(props.teleportItemId)
            }
          } else {
            if(type === ParserType.DECODE) {
              if(props.mode === MovePlayerMode.TELEPORT) {
                props.teleportCause = data.readLInt()
                props.teleportItemId = data.readLInt()
              }
            }
          }
        },
      },
      { name: 'teleportItemId', parser: DataType.L_INT },
    ])

    if(p) this.props = p
  }
}
