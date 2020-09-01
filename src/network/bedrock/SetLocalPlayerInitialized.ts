import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'

interface ISetLocalPlayerInitialized {
  entityRuntimeId: number,
}

export class SetLocalPlayerInitialized extends BatchedPacket<ISetLocalPlayerInitialized> {

  constructor(p?: ISetLocalPlayerInitialized) {
    super(Packets.SET_LOCAL_PLAYER_INITIALIZED, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
