import { Packets, DataType } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { ParserType, Packet } from '../Packet'
import { Attribute } from '../../entity/Attribute'

export interface IUpdateAttributes {
  entityRuntimeId: bigint,
  entries: Attribute[],
}

export class UpdateAttributes extends BatchedPacket<IUpdateAttributes> {

  constructor(props?: IUpdateAttributes) {
    super(Packets.UPDATE_ATTRIBUTES, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        name: 'entries',
        parser({ type, data, props, value }) {
          if(type === ParserType.DECODE) {
            props.entries = []

            for(let i = 0; i < data.readUnsignedVarInt(); i++) {
              const min = data.readLFloat()
              const max = data.readLFloat()
              const current = data.readLFloat()
              const defaultVal = data.readLFloat()
              const name = data.readString()

              const attr = Attribute.getByName(name)
              if(attr) {
                attr.minVal = min
                attr.maxVal = max
                attr.value = current
                attr.defaultVal = defaultVal

                props.entries.push(attr)
              } else {
                Packet.logger.error(`Unknown attribute: ${name}`)
              }
            }
          } else {
            data.writeUnsignedVarInt(value.length)

            for(const attr of (value as IUpdateAttributes['entries'])) {
              data.writeLFloat(attr.minVal)
              data.writeLFloat(attr.maxVal)
              data.writeLFloat(attr.value)
              data.writeLFloat(attr.defaultVal)
              data.writeString(attr.name)
            }
          }
        },
        resolve: () => [],
      },
    ])

    if(props) this.props = Object.assign({}, props)
  }

}
