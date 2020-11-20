import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType, Packet } from '../Packet'
import { Attribute } from '../../entity/Attribute'

export interface IUpdateAttributes {
  entityRuntimeId: bigint,
  entries: Attribute[],
  tick?: bigint,
}

const def = (val: any) => () => val

export class UpdateAttributes extends BatchedPacket<IUpdateAttributes> {

  constructor(props?: IUpdateAttributes) {
    super(Packets.UPDATE_ATTRIBUTES, [
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      {
        name: 'entries',
        parser({ type, data, props, value }) {
          if(type === ParserType.DECODE) {
            props.entries = []

            const count = data.readUnsignedVarInt()
            for(let i = 0; i < count; i++) {
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
      { name: 'tick', parser: DataType.U_VARLONG, resolve: def(BigInt(Math.round(Date.now() / 50))) },
    ])

    if(props) this.props = Object.assign({}, props)
  }

}
