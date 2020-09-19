import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType, IParserArgs } from '../Packet'

interface IResourcePack {
  id: string,
  version: string,
  size: bigint, // bytes
  encryptionKey: string,
  subPackName: string,
  contentId: string,
  hasScripts: boolean,
}

interface IResourcePacksInfo {
  mustAccept: boolean,
  hasScripts: boolean,
  behaviourPacks: IResourcePack[],
  resourcePacks: IResourcePack[],
}

function parsePacks(behaviourPacks: boolean) {
  return ({ type, data, props }: IParserArgs<IResourcePacksInfo>) => {
    const prop = behaviourPacks ? 'behaviourPacks' : 'resourcePacks'
    if(type === ParserType.DECODE) {
      props[prop] = []

      const count = data.readLShort()
      for(let i = 0; i < count; i++) {
        props[prop].push({
          id: data.readString(),
          version: data.readString(),
          size: data.readLLong(),
          encryptionKey: data.readString(),
          subPackName: data.readString(),
          contentId: data.readString(),
          hasScripts: data.readBoolean(),
        })
      }
    } else {
      data.writeLShort(props[prop].length)
      for(const pack of props[prop]) {
        data.writeString(pack.id)
        data.writeString(pack.version)
        data.writeLLong(pack.size)
        data.writeString(pack.encryptionKey)
        data.writeString(pack.subPackName)
        data.writeString(pack.contentId)
        data.writeBoolean(pack.hasScripts)
      }
    }
  }
}

export class ResourcePacksInfo extends BatchedPacket<IResourcePacksInfo> {

  constructor(p?: IResourcePacksInfo) {
    super(Packets.RESOURCE_PACKS_INFO, [
      { name: 'mustAccept', parser: DataType.BOOLEAN },
      { name: 'hasScripts', parser: DataType.BOOLEAN },
      { parser: parsePacks(true) },
      { parser: parsePacks(false) },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
