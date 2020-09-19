import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

interface ISetLocalPlayerInitialized {
  entityRuntimeId: bigint,
}

export class SetLocalPlayerInitialized extends BatchedPacket<ISetLocalPlayerInitialized> {

  constructor(p?: ISetLocalPlayerInitialized) {
    super(Packets.SET_LOCAL_PLAYER_INITIALIZED, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
