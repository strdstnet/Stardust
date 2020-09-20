import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'
import { MetadataType } from '../../types/player'

interface IEntityMetadata {
  entityRuntimeId: bigint,
  metadata: [MetadataType, any][]
}

export class EntityMetadata extends BatchedPacket<IEntityMetadata> {

  constructor(p?: Partial<IEntityMetadata>) {
    super(Packets.ENTITY_METADATA, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        parser({ type, props, data }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.metadata.length)
            for(const [index, tag] of Array.from(props.metadata.entries())) {
              if(!tag) continue
              const [type, value] = tag
              data.writeUnsignedVarInt(index)
              data.writeUnsignedVarInt(type)
              switch(type) {
                case MetadataType.BYTE:
                  data.writeByte(value)
                  break
                case MetadataType.FLOAT:
                  data.writeLFloat(value)
                  break
                case MetadataType.LONG:
                  data.writeVarLong(value)
                  break
                case MetadataType.STRING:
                  data.writeString(value)
                  break
                case MetadataType.SHORT:
                  data.writeLShort(value)
                  break
              }
            }
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p as IEntityMetadata)
  }

}
