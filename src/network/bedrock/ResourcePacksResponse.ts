import { Packets, DataType, ResourcePackResponseStatus } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'

interface IResourcePacksResponse {
  status: ResourcePackResponseStatus,
  packIds: string[],
}

export class ResourcePacksResponse extends BatchedPacket<IResourcePacksResponse> {

  constructor(p?: IResourcePacksResponse) {
    super(Packets.RESOURCE_PACKS_RESPONSE, [
      { name: 'status', parser: DataType.BYTE },
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            props.packIds = []
            for(let i = 0; i < data.readLShort(); i++) {
              props.packIds.push(data.readString())
            }
          } else {
            data.writeLShort(props.packIds.length)
            for(const id of props.packIds) {
              data.writeString(id)
            }
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
