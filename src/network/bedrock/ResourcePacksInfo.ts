import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'
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

      for(let i = 0; i < data.readLShort(); i++) {
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
      for(const pack of props[prop]) {
        data.writeString(pack.id)
        data.writeString(pack.version)
        data.writeLLong(pack.size)
        data.writeString(pack.encryptionKey)
        data.writeString(pack.subPackName)
        data.writeString(pack.contentId)
        data.writeBoolean(pack.hasScripts)
      }
      data.writeLShort(props[prop].length)
    }
  }
}

export class ResourcePacksInfo extends BatchedPacket<IResourcePacksInfo> {

  constructor(p?: IResourcePacksInfo) {
    super(Packets.RESOURCE_PACKS_INFO, [
      { name: 'mustAccept', parser: DataType.BOOLEAN },
      { name: 'hasScripts', parser: DataType.BOOLEAN },
      { parser: parsePacks(false) },
      { parser: parsePacks(true) },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
