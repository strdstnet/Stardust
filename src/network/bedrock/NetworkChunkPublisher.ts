import { BatchedPacket } from './BatchedPacket'
import { Packets, DataType } from '../../types'

interface INetworkChunkPublisher {
  x: number,
  y: number,
  z: number,
  radius: number,
}

export class NetworkChunkPublisher extends BatchedPacket<INetworkChunkPublisher> {

  constructor(p?: INetworkChunkPublisher) {
    super(Packets.NETWORK_CHUNK_PUBLISHER_UPDATE, [
      { name: 'x', parser: DataType.VARINT },
      { name: 'y', parser: DataType.VARINT },
      { name: 'z', parser: DataType.VARINT },
      { name: 'radius', parser: DataType.U_VARINT },
    ])

    if(p) this.props = p
  }

}
