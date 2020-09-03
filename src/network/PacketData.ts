import { Protocol, IAddress, AddressFamily } from '../types'
import zlib from 'zlib'
import Logger from '@bwatton/logger'
import { Vector3 } from 'math3d'

export enum DataLengths {
  BYTE = 1,
  SHORT = 2,
  L_SHORT = 2,
  SECURITY = 2,
  L_TRIAD = 3,
  INT = 4,
  L_INT = 4,
  LONG = 8,
  MAGIC = 16,
  FLOAT = 4,
}

export enum BitFlag {
  Valid = 0x80,
  ACK = 0x40,
  NAK = 0x20,
  PacketPair = 0x10,
  ContinuousSend = 0x08,
  NeedsBAndS = 0x04,
}

export class PacketData {

  public buf: Buffer

  public pos = 0 // BYTES

  private logger = new Logger('PacketData')

  constructor(data?: Uint8Array) {
    this.buf = Buffer.from(data ? data : [0])
  }

  public toBuffer(): Buffer {
    const buf = Buffer.alloc(this.buf.length)
    this.buf.copy(buf, 0)
    return buf
  }

  public clone(): PacketData {
    return new PacketData(this.toBuffer())
  }

  public get length(): number {
    return this.buf.length
  }

  // Unused allocated space
  private get space() {
    return this.buf.length - this.pos
  }

  public get feof(): boolean {
    return this.space < 1
  }

  public extract(offset: number = this.pos, length: number = this.buf.length): PacketData {
    const buf = new Uint8Array(length - offset)
    for(let i = 0; i <= length; i++) {
      buf[i] = this.buf[offset + i]
    }
    return new PacketData(buf)
  }

  public readRemaining(): Buffer {
    const buf = this.buf.slice(this.pos)
    this.pos = this.buf.length
    return buf
  }

  public static inflate(buffer: Buffer): PacketData {
    const buf = zlib.inflateRawSync(buffer, {
      chunkSize: 1024 * 1024 * 2,
    })
    return new PacketData(buf)
  }

  public static deflate(buffer: Buffer): PacketData {
    const buf = zlib.deflateRawSync(buffer, {
      chunkSize: 1024 * 1024 * 2,
    })
    return new PacketData(buf)
  }

  private alloc(bytes: number) {
    if(this.space < bytes) {
      this.buf = Buffer.concat([
        this.buf,
        Buffer.alloc(bytes - this.space),
      ])
    }
  }

  public append(input: Buffer | Uint8Array | PacketData, offset = 0, skip = true): void {
    if(input instanceof PacketData) {
      input = input.toBuffer()
    }

    this.alloc(input.length)

    const buf = Buffer.from(input, offset)

    buf.copy(this.buf, this.pos)

    if(skip) this.pos += input.length
  }

  /**
   * @description Splits the buffer into buffers each of no more than [mtu] size
   * @param mtu Number of bytes to split by
   */
  public split(mtu: number): PacketData[] {
    this.pos = 0
    const count = Math.ceil(this.length / mtu)

    const parts: PacketData[] = []
    for(let i = 1; i <= count; i++) {
      const data = this.read(i < count ? mtu : (this.length - this.pos))
      parts.push(new PacketData(data))
    }

    return parts
  }

  public writeByte(val: number): void {
    this.alloc(DataLengths.BYTE)

    this.buf[this.pos] = val
    this.pos++
  }

  public writeBytes(val: number, count: number): void {
    this.alloc(DataLengths.BYTE * count)

    for(let i = 0; i < count; i++) {
      this.buf[this.pos] = val
      this.pos++
    }
  }

  public readByte(skip = true): number {
    const byte = this.buf[this.pos]

    if(skip) this.pos++

    return byte
  }

  public writeLong(val: bigint): void {
    this.alloc(DataLengths.LONG)

    this.buf.writeBigInt64BE(val, this.pos)
    this.pos += DataLengths.LONG
  }

  public readLong(skip = true): bigint {
    const val = this.buf.readBigInt64BE(this.pos)

    if(skip) this.pos += DataLengths.LONG

    return val
  }

  public writeLLong(val: bigint): void {
    this.alloc(DataLengths.LONG)

    this.buf.writeBigInt64LE(val, this.pos)
    this.pos += DataLengths.LONG
  }

  public readLLong(skip = true): bigint {
    const val = this.buf.readBigInt64LE(this.pos)

    if(skip) this.pos += DataLengths.LONG

    return val
  }

  public writeMagic(): void {
    const buf = Buffer.from(Protocol.MAGIC, 'binary')

    this.append(buf)
  }

  public readMagic(): (typeof Protocol.MAGIC) {
    const buf = this.buf.slice(this.pos, this.pos + 16)
    this.pos += DataLengths.MAGIC

    return buf.toString('binary')
  }

  public writeShort(val: number): void {
    this.alloc(DataLengths.SHORT)

    this.buf.writeUInt16BE(val, this.pos)
    this.pos += DataLengths.SHORT
  }

  public readShort(skip = true): number {
    const val = this.buf.readUInt16BE(this.pos)

    if(skip) this.pos += DataLengths.SHORT

    return val
  }

  public writeUnsignedVarInt(val: number): void {
    for (let i = 0; i < 5; i++) {
      if ((val >> 7) !== 0) {
        this.writeByte(val | 0x80)
      } else {
        this.writeByte(val & 0x7f)
        break
      }
      val >>= 7
    }
  }

  public readUnsignedVarInt(skip = true): number {
    let value = 0

    for (let i = 0; i <= 28; i += 7) {
      const b = this.readByte(skip)
      value |= ((b & 0x7f) << i)

      if ((b & 0x80) === 0) {
        return value
      }
    }

    return 0
  }

  public readUnsignedVarLong(skip = true): number {
    let value = 0

    for(let i = 0; i <= 63; i += 7) {
      const b = this.readByte(skip)
      value |= ((b & 0x7f) << i)

      if ((b & 0x80) === 0) {
        return value
      }
    }

    return 0
  }

  public writeUnsignedVarLong(val: number): void {
    for (let i = 0; i < 10; i++) {
      if ((val >> 7) !== 0) {
        this.writeByte(val | 0x80)
      } else {
        this.writeByte(val & 0x7f)
        break
      }
      val >>= 7
    }
  }

  public read(len: number, skip = true): Buffer {
    const buf = this.buf.slice(this.pos, this.pos + len)
    if(skip) this.pos += len
    return buf
  }

  public readString(len: number = this.readUnsignedVarInt(), skip = true): string {
    return this.read(len, skip).toString('utf8')
  }

  public writeString(val: string, writeLength = true): void {
    if(writeLength) this.writeUnsignedVarInt(val.length)
    this.append(Buffer.from(val, 'utf8'))
  }

  public readSecuity(): void {
    this.pos += DataLengths.SECURITY
  }

  public readBoolean(): boolean {
    return this.readByte() !== 0x00
  }

  public writeBoolean(v: boolean): void {
    this.writeByte(v === true ? 1 : 0)
  }

  public readLShort(skip = true): number {
    const val = this.buf.readUInt16LE(this.pos)

    if(skip) this.pos += DataLengths.L_SHORT

    return val
  }

  public writeLShort(val: number, skip = true): void {
    this.alloc(DataLengths.L_SHORT)

    this.buf.writeUInt16LE(val, this.pos)
    if(skip) this.pos += DataLengths.L_SHORT
  }

  public writeSignedLShort(val: number, skip = true): void {
    this.alloc(DataLengths.L_SHORT)

    this.buf.writeInt16LE(val, this.pos)
    if(skip) this.pos += DataLengths.L_SHORT
  }

  public readSignedLShort(skip = true): number {
    const val = this.buf.readInt16LE(this.pos)

    if(skip) this.pos += DataLengths.L_SHORT

    return val
  }

  public readByteArray(length: number = this.readUnsignedVarInt(), skip = true): PacketData {
    return new PacketData(this.read(length, skip))
  }

  public writeByteArray(data: PacketData, writeLength = true): void {
    if(writeLength) this.writeUnsignedVarInt(data.length)

    this.append(data.buf)
  }

  public readLInt(skip = true): number {
    const val = this.buf.readInt32LE(this.pos)

    if(skip) this.pos += DataLengths.L_INT

    return val
  }

  public writeLInt(val: number, skip = true): void {
    this.alloc(DataLengths.L_INT)

    this.buf.writeInt32LE(val, this.pos)
    if(skip) this.pos += DataLengths.L_INT
  }

  public readAddress(): IAddress {
    let ip, port
    const family = this.readByte()
    switch(family) {
      case AddressFamily.IPV4:
        ip = []
        for (let i = 0; i < 4; i++) {
          ip.push(~this.readByte() & 0xff)
        }
        ip = ip.join('.')
        port = this.readShort()
        break
      case AddressFamily.IPV6:
        this.readLShort()
        port = this.readShort()
        this.readInt()
        ip = this.readIPv6IP()
        this.readInt()
        break
      default:
        throw new Error(`Unsupported family ${family}`)
    }

    return {
      ip,
      port,
      family,
    }
  }

  private readIPv6IP() {
    const parts = []
    for (let i = 0; i < 16; i++) {
      parts.push(this.readByte().toString(16))
    }

    let m = ''
    return parts.join(':').replace(/((^|:)0(?=:|$))+:?/g, t => {
      m = (t.length > m.length) ? t : m
      return t
    }).replace(m || ' ', '::')
  }

  public writeAddress({ ip, port, family }: IAddress): this {
    this.writeByte(family)
    switch (family) {
      case AddressFamily.IPV4:
        ip.split('.', 4).forEach(b => this.writeByte(~parseInt(b, 10) & 0xff))
        this.writeShort(port)
        break
      case AddressFamily.IPV6:
        this.logger.error('IPV6 writing is not yet supported')
        break
      default:
        this.logger.error('ERR -> Unknown address family:', family)
    }
    return this
  }


  public readLTriad(): number {
    const triad = this.buf.readUIntLE(this.pos, DataLengths.L_TRIAD)

    this.pos += DataLengths.L_TRIAD

    return triad
  }

  public writeLTriad(v: number): void {
    this.alloc(DataLengths.L_TRIAD)
    this.buf.writeUIntLE(v, this.pos, DataLengths.L_TRIAD)
    this.pos += DataLengths.L_TRIAD
  }

  public readInt(): number {
    const int = this.buf.readInt32BE(this.pos)

    this.pos += DataLengths.INT

    return int
  }

  public readIntLE(): number {
    const int = this.buf.readInt32LE(this.pos)

    this.pos += DataLengths.INT

    return int
  }

  public writeInt(v: number): void {
    this.alloc(DataLengths.INT)
    this.buf.writeInt32BE(v, this.pos)
    this.pos += DataLengths.INT
  }

  public writeFloat(v: number): void {
    this.alloc(DataLengths.FLOAT)
    this.buf.writeFloatBE(v, this.pos)
    this.pos += DataLengths.FLOAT
  }

  public writeLFloat(v: number): void {
    this.alloc(DataLengths.FLOAT)
    this.buf.writeFloatLE(v, this.pos)
    this.pos += DataLengths.FLOAT
  }

  public readLFloat(skip = true): number {
    const float = this.buf.readFloatLE(this.pos)

    if(skip) this.pos += DataLengths.FLOAT

    return float
  }

  public writeVarInt(v: number): void {
    v <<= 32 >> 32
    this.writeUnsignedVarInt((v << 1) ^ (v >> 31))
  }

  public readVarInt(skip = true): number {
    const raw = this.readUnsignedVarInt(skip)
    const tmp = (((raw << 63) >> 63) ^ raw) >> 1
    return tmp ^ (raw & (1 << 63))
  }

  public writeVector3Float(v3: Vector3): void {
    this.writeFloat(v3.x)
    this.writeFloat(v3.y)
    this.writeFloat(v3.z)
  }

  public writeVector3(v3: Vector3): void {
    this.writeLFloat(v3.y)
    this.writeLFloat(v3.z)
    this.writeLFloat(v3.x)
  }

  public readVector3(skip = true): Vector3 {
    return new Vector3(
      this.readLFloat(skip),
      this.readLFloat(skip),
      this.readLFloat(skip)
    )
  }

  public writeVector3VarInt(v3: Vector3): void {
    this.writeVarInt(v3.x)
    this.writeVarInt(v3.y)
    this.writeVarInt(v3.z)
  }

  public readVarLong(skip = true): number {
    const raw = this.readUnsignedVarLong(skip)
    const tmp = (((raw << 63) >> 63) ^ raw) >> 1
    return tmp ^ (raw & -2147483648)
  }

  public writeVarLong(v: number): void {
    this.writeUnsignedVarLong((v << 1) ^ (v >> 63))
  }

}
