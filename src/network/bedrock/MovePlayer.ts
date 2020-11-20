import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'

export enum MovePlayerMode {
  NORMAL = 0,
  RESET = 1,
  TELEPORT = 2,
  PITCH = 3,
}

interface IMovePlayer {
  runtimeEntityId: bigint,
  positionX: number,
  positionY: number,
  positionZ: number,
  pitch: number,
  yaw: number,
  headYaw: number,
  mode?: MovePlayerMode,
  onGround: boolean,
  ridingEntityRuntimeId: bigint,
  teleportCause: number,
  teleportItemId: number,
  tick?: bigint
}

const def = (val: any) => () => val

export class MovePlayer extends BatchedPacket<IMovePlayer> {
  constructor(p?: Partial<IMovePlayer>) {
    super(Packets.MOVE_PLAYER, [
      { name: 'runtimeEntityId', parser: DataType.U_VARLONG },
      { name: 'positionX', parser: DataType.L_FLOAT },
      { name: 'positionY', parser: DataType.L_FLOAT },
      { name: 'positionZ', parser: DataType.L_FLOAT },
      { name: 'pitch', parser: DataType.L_FLOAT },
      { name: 'yaw', parser: DataType.L_FLOAT },
      { name: 'headYaw', parser: DataType.L_FLOAT },
      { name: 'mode', parser: DataType.BYTE, resolve: def(MovePlayerMode.NORMAL) },
      { name: 'onGround', parser: DataType.BOOLEAN },
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
      { name: 'tick', parser: DataType.U_VARLONG, resolve: def(0n) },
    ])

    if(p) this.props = p as IMovePlayer
  }
}
