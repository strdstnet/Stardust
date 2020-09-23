import zlib from 'zlib'
import Logger from '@bwatton/logger'
import { Vector3 } from 'math3d'
import { Protocol } from '../types/protocol'
import { AddressFamily, IAddress } from '../types/network'
import { Item } from '../item/Item'
import { Items } from '../types/world'
import { UUID } from './UUID'
import { MetadataType, SkinData, SkinImage } from '../types/player'
import { Chunk } from '../level/Chunk'
import { SubChunk } from '../level/SubChunk'
import { Metadata } from '../entity/Metadata'
import { Tag, TagType } from '../nbt/Tag'
import { EndTag } from '../nbt/EndTag'
import { TagMapper } from '../nbt/TagMapper'

export enum DataLengths {
  BYTE = 1,
  SHORT = 2,
  L_SHORT = 2,
  SECURITY = 2,
  L_TRIAD = 3,
  INT = 4,
  L_INT = 4,
  FLOAT = 4,
  DOUBLE = 8,
  LONG = 8,
  MAGIC = 16,
}

export enum BitFlag {
  Valid = 0x80,
  ACK = 0x40,
  NAK = 0x20,
  PacketPair = 0x10,
  ContinuousSend = 0x08,
  NeedsBAndS = 0x04,
}

// TODO: Make singleton?
export class BinaryData {

  public buf: Buffer

  public pos = 0 // BYTES

  private logger = new Logger('BinaryData')

  constructor(data?: Uint8Array) {
    this.buf = Buffer.from(data ? data : [0])
  }

  public toBuffer(): Buffer {
    const buf = Buffer.alloc(this.buf.length)
    this.buf.copy(buf, 0)
    return buf
  }

  public clone(): BinaryData {
    return new BinaryData(this.toBuffer())
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

  public ensureLength(length: number, filler = '\x00'): BinaryData {
    if(this.length === length) return this

    if(this.length > length) {
      this.buf = this.buf.slice(0, length)
    } else {
      this.writeString(filler.repeat(this.length - length), false, false)
    }

    return this
  }

  public extract(offset: number = this.pos, length: number = this.buf.length): BinaryData {
    const buf = new Uint8Array(length - offset)
    for(let i = 0; i <= length; i++) {
      buf[i] = this.buf[offset + i]
    }
    return new BinaryData(buf)
  }

  public readRemaining(): Buffer {
    const buf = this.buf.slice(this.pos)
    this.pos = this.buf.length
    return buf
  }

  public static inflate(buffer: Buffer): BinaryData {
    const buf = zlib.inflateRawSync(buffer, {
      chunkSize: 1024 * 1024 * 2,
    })
    return new BinaryData(buf)
  }

  public static deflate(buffer: Buffer): BinaryData {
    const buf = zlib.deflateRawSync(buffer, {
      chunkSize: 1024 * 1024 * 2,
    })
    return new BinaryData(buf)
  }

  private alloc(bytes: number) {
    if(this.space < bytes) {
      this.buf = Buffer.concat([
        this.buf,
        Buffer.alloc(bytes - this.space),
      ])
    }
  }

  public append(input: Buffer | Uint8Array | BinaryData, offset = 0, skip = true): void {
    if(input instanceof BinaryData) {
      input = input.toBuffer()
    }

    this.alloc(input.length)

    const buf = Buffer.from(input, offset)

    buf.copy(this.buf, this.pos)

    if(skip) this.pos += input.length
  }

  public appendWithLength(input: Buffer | Uint8Array | BinaryData): void {
    this.writeUnsignedVarInt(input.length)
    this.append(input)
  }

  /**
   * @description Splits the buffer into buffers each of no more than [mtu] size
   * @param mtu Number of bytes to split by
   */
  public split(mtu: number): BinaryData[] {
    this.pos = 0
    const count = Math.ceil(this.length / mtu)

    const parts: BinaryData[] = []
    for(let i = 1; i <= count; i++) {
      const data = this.read(i < count ? mtu : (this.length - this.pos))
      parts.push(new BinaryData(data))
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

  public readBytes(len: number, skip = true): number[] {
    return Array.from(this.read(len, skip))
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

  public readUnsignedVarLongNumber(skip = true): number {
    let value = 0

    for(let i = 0; i <= 63; i += 7) {
      const b = this.readByte(skip)
      value |= ((b & 0x7f) << i)

      if ((b & 0x80) === 0) {
        return value
      }
    }

    throw new Error('VarLong did not terminate after 10 bytes')
  }

  public readUnsignedVarLong(skip = true): bigint {
    return BigInt(this.readUnsignedVarLongNumber(skip))
  }

  public writeUnsignedVarLong(v: bigint): void {
    for (let i = 0; i < 10; i++) {
      if ((v >> 7n) !== 0n) {
        this.writeByte(Number(v | 0x80n))
      } else {
        this.writeByte(Number(v & 0x7fn))
        break
      }
      v >>= 7n
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

  public writeString(val: string, writeLength = true, skip = true): void {
    if(writeLength) this.writeUnsignedVarInt(val.length)
    this.append(Buffer.from(val, 'utf8'), 0, skip)
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

  public readByteArray(length: number = this.readUnsignedVarInt(), skip = true): BinaryData {
    return new BinaryData(this.read(length, skip))
  }

  public writeByteArray(data: BinaryData, writeLength = true): void {
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
    this.writeLFloat(v3.x)
    this.writeLFloat(v3.y)
    this.writeLFloat(v3.z)
  }

  public readVector3(skip = true): Vector3 {
    return new Vector3(
      this.readLFloat(skip),
      this.readLFloat(skip),
      this.readLFloat(skip),
    )
  }

  public writeVector3VarInt(v3: Vector3): void {
    this.writeVarInt(v3.x)
    this.writeVarInt(v3.y)
    this.writeVarInt(v3.z)
  }

  public readVarLong(skip = true): bigint {
    const raw = this.readUnsignedVarLongNumber(skip)
    const tmp = (((raw << 63) >> 63) ^ raw) >> 1
    return BigInt(tmp ^ (raw & (1 << 63)))
  }

  public writeVarLong(v: bigint): void {
    // const val = Number(v)
    this.writeUnsignedVarLong((v << 1n) ^ (v >> 63n))
  }

  public writeContainerItem(item: Item): void {
    // this.writeBoolean(!!item.count && item.id !== Items.AIR)

    this.writeVarInt(item.id)
    if(item.id === Items.AIR) return

    const auxValue = ((item.damage & 0x7fff) << 8) | item.count
    this.writeVarInt(auxValue)

    if(item.nbt) {
      // TODO: Compound tags
      // https://github.com/pmmp/PocketMine-MP/blob/f9c2ed620008a695bef2c4d141c0d26880e77040/src/pocketmine/network/mcpe/NetworkBinaryStream.php#L259
    } else {
      this.writeLShort(0)
    }

    this.writeVarInt(0) // CanPlaceOn
    this.writeVarInt(0) // CanDestroy

    if(item.id === Items.SHIELD) {
      this.writeVarLong(0n) // some shit
    }
  }

  public writeUUID(uuid: UUID): void {
    this.writeLInt(uuid.parts[1])
    this.writeLInt(uuid.parts[0])
    this.writeLInt(uuid.parts[3])
    this.writeLInt(uuid.parts[2])
  }

  public readUUID(): UUID {
    const p1 = this.readLInt()
    const p2 = this.readLInt()
    const p3 = this.readLInt()
    const p4 = this.readLInt()

    return new UUID(p1, p2, p3, p4)
  }

  public writeSkinImage(image: SkinImage): void {
    this.writeLInt(image.width)
    this.writeLInt(image.height)
    // this.writeString(image.data)
    this.appendWithLength(image.data)
  }

  public writeSkin(skin: SkinData): void {
    this.writeString(skin.id)
    // this.writeString(skin.resourcePatch)
    this.appendWithLength(skin.resourcePatch)
    this.writeSkinImage(skin.image)
    this.writeLInt(skin.animations.length)
    for(const animation of skin.animations) {
      this.writeSkinImage(animation.image)
      this.writeLInt(animation.type)
      this.writeLFloat(animation.frames)
    }
    this.writeSkinImage(skin.cape.image)
    // this.writeString(skin.geometryData)
    this.appendWithLength(skin.geometryData)
    // this.writeString(skin.animationData)
    this.appendWithLength(skin.animationData)
    this.writeBoolean(skin.premium)
    this.writeBoolean(skin.persona)
    this.writeBoolean(skin.personaCapeOnClassic)
    this.writeString(skin.cape.id)
    this.writeString(UUID.random().toString())
    this.writeString(skin.armSize)
    this.writeString(skin.color)
    this.writeLInt(skin.personaPieces.length)
    for(const piece of skin.personaPieces) {
      this.writeString(piece.id)
      this.writeString(piece.type)
      this.writeString(piece.packId)
      this.writeBoolean(piece.defaultPiece)
      this.writeString(piece.productId)
    }
    this.writeLInt(skin.personaPieceTints.length)
    for(const tint of skin.personaPieceTints) {
      this.writeString(tint.type)
      this.writeLInt(tint.colors.length)
      for(const color of tint.colors) {
        this.writeString(color)
      }
    }
  }

  public writeChunk(chunk: Chunk): void {
    const data = new BinaryData()

    const nonEmptyCount = chunk.highestNonEmptySubChunk() + 1
    for(let y = 0; y < nonEmptyCount; y++) {
    // for(let y = 0; y < 16; y++) {
      const subChunk = chunk.subChunks[y]

      data.writeByte(0) // Anvil version
      data.append(new Uint8Array(subChunk.blockData))
      data.append(new Uint8Array(subChunk.data))
    }

    data.append(new Uint8Array(chunk.biomeData))
    data.writeByte(0)

    this.writeUnsignedVarInt(data.length)
    this.append(data)

    // TODO: Tiles
    // https://github.com/pmmp/PocketMine-MP/blob/9d0ac297bbeb4b9a4330685b24c4045f7fb0c5e9/src/pocketmine/level/format/Chunk.php#L848-L848
  }

  public readChunkData(chunk: Chunk, numSubChunks: number): void {
    for(let y = 0; y < numSubChunks; y++) {
      const version = this.readByte()

      if(version === 0) {
        const blockData = this.read(4096)
        const data = this.read(2048)

        chunk.subChunks[y] = new SubChunk(Array.from(data), Array.from(blockData), [], [])
      } else {
        throw new Error(`Unsupported Anvil version: ${version}`)
      }
    }

    chunk.biomeData = Array.from(this.read(256))
    this.readByte() // no idea what this is
  }

  public writeEntityMetadata(metadata: Metadata): void {
    this.writeUnsignedVarInt(metadata.size)

    for(const { flag, type, value } of metadata.all()) {
      this.writeUnsignedVarInt(flag)
      this.writeUnsignedVarInt(type)
      switch(type) {
        case MetadataType.BYTE:
          this.writeByte(value)
          break
        case MetadataType.FLOAT:
          this.writeLFloat(value)
          break
        case MetadataType.LONG:
          this.writeVarLong(value)
          break
        case MetadataType.STRING:
          this.writeString(value)
          break
        case MetadataType.SHORT:
          this.writeSignedLShort(value)
          break
        default:
          throw new Error(`Unknown MetadataType: ${type}`)
      }
    }
  }

  public readEntityMetadata(): Metadata {
    const metadata = new Metadata()

    const count = this.readUnsignedVarInt()
    for(let i = 0; i < count; i++) {
      const flag = this.readUnsignedVarInt()
      const type = this.readUnsignedVarInt()

      switch(type) {
        case MetadataType.BYTE:
          metadata.add(flag, type, this.readByte())
          break
        case MetadataType.FLOAT:
          metadata.add(flag, type, this.readLFloat())
          break
        case MetadataType.LONG:
          metadata.add(flag, type, this.readVarLong())
          break
        case MetadataType.STRING:
          metadata.add(flag, type, this.readString())
          break
        case MetadataType.SHORT:
          metadata.add(flag, type, this.readSignedLShort())
          break
        default:
          throw new Error(`Unknown MetadataType: ${type}`)
      }
    }

    return metadata
  }

  public readLDouble(skip = true): number {
    const double = this.buf.readDoubleLE(this.pos)

    if(skip) this.pos += DataLengths.DOUBLE

    return double
  }

  public readTag(): Tag {
    const type = this.readByte()

    if(type === TagType.End) return new EndTag()

    const tag = TagMapper.get(type)
    tag.name = this.readString()
    tag.readValue(this)

    return tag
  }

}