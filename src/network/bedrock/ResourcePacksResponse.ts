import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ResourcePackResponseStatus } from '../../types/world'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'

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

            const count = data.readLShort()
            for(let i = 0; i < count; i++) {
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
