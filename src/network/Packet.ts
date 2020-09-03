import { PacketData } from './PacketData'
import { DataType } from '../types'
import Logger from '@bwatton/logger'

export enum ParserType {
  ENCODE,
  DECODE,
}

export interface IParserArgs<T> {
  type: ParserType,
  data: PacketData,
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

const encodeDataType = (data: PacketData, type: DataType, value: any, p?: string) => {
  if(type === DataType.MAGIC) {
    return data.writeMagic()
  }

  if(typeof value === 'undefined') {
    console.log('UNDEFINED', value, p)
    return
  }

  switch(type) {
    case DataType.BYTE:
      data.writeByte(value)
      break
    case DataType.LONG:
      data.writeLong(value instanceof BigInt ? Number(value) : value)
      break
    case DataType.SHORT:
      data.writeShort(value)
      break
    case DataType.L_SHORT:
      data.writeLShort(value)
      break
    case DataType.STRING:
      data.writeString(value, true)
      break
    case DataType.RAW_STRING:
      data.writeShort(value.length)
      data.writeString(value, false)
      break
    case DataType.BOOLEAN:
      data.writeBoolean(value)
      break
    case DataType.ADDRESS:
      data.writeAddress(value)
      break
    case DataType.L_TRIAD:
      data.writeLTriad(value)
      break
    case DataType.INT:
      data.writeInt(value)
      break
    case DataType.VECTOR3_VARINT:
      data.writeVector3VarInt(value)
      break
    case DataType.VECTOR3_FLOAT:
      data.writeVector3Float(value)
      break
    case DataType.VECTOR3:
      data.writeVector3(value)
      break
    case DataType.VARINT:
      data.writeVarInt(value)
      break
    case DataType.U_VARLONG:
      data.writeUnsignedVarLong(value)
      break
    case DataType.U_VARINT:
      data.writeUnsignedVarInt(value)
      break
    case DataType.VARLONG:
      data.writeVarLong(value)
      break
    case DataType.L_FLOAT:
      data.writeLFloat(value)
      break
    case DataType.L_INT:
      data.writeLInt(value)
      break
    case DataType.L_LONG:
      data.writeLLong(value)
      break
  }
}

const decodeDataType = (data: PacketData, type: DataType) => {
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
  }
}

export abstract class Packet<T> {

  protected static logger = new Logger('Packet')

  protected encodeId = true
  protected decodeId = true

  public props: T = ({} as T)

  public data!: PacketData

  constructor(public id: number, protected schema: Array<IPacketSchemaItem<T>>) {

  }

  protected get logger(): Logger {
    return Packet.logger
  }

  public encode(props: T = {} as T): PacketData {
    const data = new PacketData()
    if(this.encodeId) data.writeByte(this.id)

    if(!this.props) this.props = ({} as T)

    Object.assign(this.props, props)

    this.schema.forEach(({ name, parser, resolve }) => {
      const value = resolve ? resolve(this.props) : (name ? (this.props as any)[name] : null)

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
  public decode(data: PacketData): PacketProps<T> {
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

  public parse(data: PacketData): this {
    // eslint-disable-next-line deprecation/deprecation
    this.decode(data)

    return this
  }

}
