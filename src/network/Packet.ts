import { BinaryData } from '../utils/BinaryData'
import { DataType } from '../types/data'
import Logger from '@bwatton/logger'

export enum ParserType {
  ENCODE,
  DECODE,
}

export interface IParserArgs<T> {
  type: ParserType,
  data: BinaryData,
  props: T,
  value: any,
  self: Packet<T>,
}

type SchemaItemParser<T> = (args: IParserArgs<T>) => void

export interface IPacketSchemaItem<T> {
  name?: string,
  parser: DataType | SchemaItemParser<T>,
  resolve?: (props: T) => any,
}

interface IPacket {
  id: number,
}

export type PacketProps<T> = IPacket & T

const encodeDataType = (data: BinaryData, type: DataType, value: any, p?: string): void => {
  if(type === DataType.MAGIC) {
    return data.writeMagic()
  }

  if(typeof value === 'undefined') {
    console.log('UNDEFINED', value, p)
    return
  }

  switch(type) {
    case DataType.BYTE:
      return data.writeByte(value)
    case DataType.LONG:
      return data.writeLong(value)
    case DataType.SHORT:
      return data.writeShort(value)
    case DataType.L_SHORT:
      return data.writeLShort(value)
    case DataType.STRING:
      return data.writeString(value, true)
    case DataType.RAW_STRING:
      data.writeShort(value.length)
      return data.writeString(value, false)
    case DataType.BOOLEAN:
      return data.writeBoolean(value)
    case DataType.ADDRESS:
      return data.writeAddress(value)
    case DataType.L_TRIAD:
      return data.writeLTriad(value)
    case DataType.INT:
      return data.writeInt(value)
    case DataType.VECTOR3_VARINT:
      return data.writeVector3VarInt(value)
    case DataType.VECTOR3_FLOAT:
      return data.writeVector3Float(value)
    case DataType.VECTOR3:
      return data.writeVector3(value)
    case DataType.VARINT:
      return data.writeVarInt(value)
    case DataType.U_VARLONG:
      return data.writeUnsignedVarLong(value)
    case DataType.U_VARINT:
      return data.writeUnsignedVarInt(value)
    case DataType.VARLONG:
      return data.writeVarLong(value)
    case DataType.L_FLOAT:
      return data.writeLFloat(value)
    case DataType.L_INT:
      return data.writeLInt(value)
    case DataType.L_LONG:
      return data.writeLLong(value)
    case DataType.CONTAINER_ITEM:
      return data.writeContainerItem(value)
    case DataType.CHUNK:
      return data.writeChunk(value)
    case DataType.UUID:
      return data.writeUUID(value)
    case DataType.ENTITY_METADATA:
      return data.writeEntityMetadata(value)
    case DataType.BYTE_ROTATION:
      return data.writeByteRotation(value)
    case DataType.BLOCK_POSITION:
      return data.writeBlockPosition(value)
    default:
      console.error('Unknown DataType on write:', type)
  }
}

const decodeDataType = (data: BinaryData, type: DataType) => {
  switch(type) {
    case DataType.BYTE:
      return data.readByte()
    case DataType.LONG:
      return data.readLong()
    case DataType.MAGIC:
      return data.readMagic()
    case DataType.SHORT:
      return data.readShort()
    case DataType.SECURITY:
      return data.readSecuity()
    case DataType.BOOLEAN:
      return data.readBoolean()
    case DataType.RAW_STRING:
      return data.readString(data.readShort())
    case DataType.ADDRESS:
      return data.readAddress()
    case DataType.L_TRIAD:
      return data.readLTriad()
    case DataType.INT:
      return data.readInt()
    case DataType.STRING:
      return data.readString()
    case DataType.L_SHORT:
      return data.readLShort()
    case DataType.VARINT:
      return data.readVarInt()
    case DataType.VECTOR3:
      return data.readVector3()
    case DataType.U_VARLONG:
      return data.readUnsignedVarLong()
    case DataType.U_VARINT:
      return data.readUnsignedVarInt()
    case DataType.VARLONG:
      return data.readVarLong()
    case DataType.L_FLOAT:
      return data.readLFloat()
    case DataType.L_INT:
      return data.readLInt()
    case DataType.L_LONG:
      return data.readLLong()
    case DataType.UUID:
      return data.readUUID()
    case DataType.ENTITY_METADATA:
      return data.readEntityMetadata()
    case DataType.CONTAINER_ITEM:
      return data.readContainerItem()
    case DataType.BYTE_ROTATION:
      return data.readByteRotation()
    case DataType.BLOCK_POSITION:
      return data.readBlockPosition()
    default:
      console.error('Unknown DataType on read:', type)
  }
}

export abstract class Packet<T> {

  protected static logger = new Logger('Packet')

  protected encodeId = true
  protected decodeId = true

  public props: T = ({} as T)

  public data!: BinaryData

  constructor(public id: number, protected schema: Array<IPacketSchemaItem<T>>) {

  }

  protected get logger(): Logger {
    return Packet.logger
  }

  private validVal(val: any): boolean {
    return typeof val !== 'undefined' && val !== null
  }

  public encode(props: T = {} as T): BinaryData {
    const data = new BinaryData()
    if(this.encodeId) data.writeByte(this.id)

    if(!this.props) this.props = ({} as T)

    Object.assign(this.props, props)

    this.schema.forEach(({ name, parser, resolve }) => {
      const propsVal = name && this.validVal((this.props as any)[name]) ? (this.props as any)[name] : null
      const value = this.validVal(propsVal) ? propsVal : (resolve ? resolve(this.props) : null)

      if(typeof parser === 'function') {
        parser({
          type: ParserType.ENCODE,
          data,
          props: this.props,
          value,
          self: this,
        })
      } else {
        encodeDataType(data, parser, value, name)
      }
    })

    this.data = data

    return data
  }

  /**
   * @deprecated Use Packet.parse() instead
   */
  public decode(data: BinaryData): PacketProps<T> {
    this.data = data
    const props: T = this.props || ({} as T)

    this.id = (this.decodeId ? data.readByte() : this.id)

    this.schema.forEach(({ name, parser }) => {
      if(typeof parser === 'function') {
        parser({
          type: ParserType.DECODE,
          data,
          props: props as T,
          value: null,
          self: this,
        })
      } else {
        const result = decodeDataType(data, parser)

        if(name) (props as any)[name] = result
      }
    })

    this.props = props

    this.data = data.clone()

    return {
      ...props,
      id: this.id,
    }
  }

  public parse(data: BinaryData): this {
    // eslint-disable-next-line deprecation/deprecation
    this.decode(data)

    return this
  }

}
