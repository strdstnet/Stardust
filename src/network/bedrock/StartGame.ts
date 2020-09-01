import { BatchedPacket } from './BatchedPacket'
import { Vector3 } from 'math3d'
import { Packets, DataType, Gamemode } from '../../types'

interface IStartGame {
  entityUniqueId: number,
  entityRuntimeId: number,
  playerGamemode: Gamemode,
  playerPosition: Vector3,
  playerPitch: number,
  playerYaw: number,
  seed: number,
}

export class StartGame extends BatchedPacket<IStartGame> {

  constructor() {
    super(Packets.START_GAME, [
      { name: 'entityUniqueId', parser: DataType.VARLONG },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'playerGamemode', parser: DataType.VARINT },
      { name: 'playerPosition', parser: DataType.VECTOR3 },
      { name: 'playerPitch', parser: DataType.L_FLOAT },
      { name: 'playerYaw', parser: DataType.L_FLOAT },
      { name: 'seed', parser: DataType.VARINT },
    ])
  }

}
