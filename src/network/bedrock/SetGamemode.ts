import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { Gamemode } from '../../types/world'
import { BatchedPacket } from '../bedrock/BatchedPacket'

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
