import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'
import { MetadataType } from '../../types/player'
import { Metadata } from '../../entity/Metadata'

interface IEntityMetadata {
  entityRuntimeId: bigint,
  metadata: Metadata,
}

export class EntityMetadata extends BatchedPacket<IEntityMetadata> {

  constructor(p?: Partial<IEntityMetadata>) {
    super(Packets.ENTITY_METADATA, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        parser({ type, props, data }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(props.metadata.size)
            for(const { flag, type, value } of props.metadata.all()) {
              console.log(`${flag} (${type}) => ${value}`)

              data.writeUnsignedVarInt(flag)
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
                  data.writeSignedLShort(value)
                  break
                default:
                  throw new Error(`Unknown MetadataType: ${type}`)
              }
            }
          } else {
            const metadata = new Metadata()

            const count = data.readUnsignedVarInt()
            for(let i = 0; i < count; i++) {
              const flag = data.readUnsignedVarInt()
              const type = data.readUnsignedVarInt()

              switch(type) {
                case MetadataType.BYTE:
                  metadata.add(flag, type, data.readByte())
                  break
                case MetadataType.FLOAT:
                  metadata.add(flag, type, data.readLFloat())
                  break
                case MetadataType.LONG:
                  metadata.add(flag, type, data.readVarLong())
                  break
                case MetadataType.STRING:
                  metadata.add(flag, type, data.readString())
                  break
                case MetadataType.SHORT:
                  metadata.add(flag, type, data.readSignedLShort())
                  break
              }
            }

            props.metadata = metadata
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p as IEntityMetadata)
  }

}
