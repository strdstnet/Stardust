import { Packets, DataType, Gamemode } from '../../types'
import { BatchedPacket } from './BatchedPacket'

interface ISetGamemode {
  mode: Gamemode,
}

export class SetGamemode extends BatchedPacket<ISetGamemode> {

  constructor(p?: ISetGamemode) {
    super(Packets.SET_GAMEMODE, [
      { name: 'mode', parser: DataType.VARINT },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
