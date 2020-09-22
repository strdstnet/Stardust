import { BinaryData } from '../utils/BinaryData'
import { Protocol } from '../types/protocol'

describe('Bytes', () => {
  it('reads bytes correctly', () => {
    const byte = 6

    const buf = Buffer.alloc(1)
    buf[0] = byte
    const data = new BinaryData(buf)

    expect(data.readByte()).toEqual(byte)
  })
  it('writes bytes correctly', () => {
    const byte = 6

    const data = new BinaryData()
    data.writeByte(byte)

    data.pos = 0

    expect(data.readByte()).toEqual(byte)
  })
})

describe('Shorts', () => {
  it('reads shorts correctly', () => {
    const short = 69

    const buf = Buffer.alloc(2)
    buf.writeInt16BE(short, 0)
    const data = new BinaryData(buf)

    expect(data.readShort()).toEqual(short)
  })
  it('writes shorts correctly', () => {
    const short = 69

    const data = new BinaryData()
    data.writeShort(short)

    data.pos = 0

    expect(data.readShort()).toEqual(short)
  })
})

describe('Integers', () => {
  it('reads ints correctly', () => {
    const int = 69

    const buf = Buffer.alloc(4)
    buf.writeInt32BE(int, 0)
    const data = new BinaryData(buf)

    expect(data.readInt()).toEqual(int)
  })
  it('writes ints correctly', () => {
    const int = 69

    const data = new BinaryData()
    data.writeInt(int)

    data.pos = 0

    expect(data.readInt()).toEqual(int)
  })

  it('reads little ints correctly', () => {
    const int = 69

    const buf = Buffer.alloc(4)
    buf.writeInt32LE(int, 0)
    const data = new BinaryData(buf)

    expect(data.readLInt()).toEqual(int)
  })
  it('writes little ints correctly', () => {
    const int = 69

    const data = new BinaryData()
    data.writeLInt(int)

    data.pos = 0

    expect(data.readLInt()).toEqual(int)
  })
})

describe('Longs', () => {
  it('reads longs correctly', () => {
    const long = 925686942n

    const buf = Buffer.alloc(8)
    buf.writeBigInt64BE(long, 0)
    const data = new BinaryData(buf)

    expect(data.readLong()).toEqual(long)
  })
  it('writes longs correctly', () => {
    const long = 925686942n

    const data = new BinaryData()
    data.writeLong(long)

    data.pos = 0

    expect(data.readLong()).toEqual(long)
  })
})

describe('Var Longs', () => {
  it('reads & writes var longs correctly', () => {
    const long = 281474976710656n

    const data = new BinaryData()
    data.writeVarLong(long)
    data.pos = 0

    expect(data.readVarLong()).toEqual(long)
  })
  it('reads & writes multiple var longs correctly', () => {
    const long1 = 925686942n
    const long2 = 925686946n
    const long3 = 925686944n

    const data = new BinaryData()
    data.writeVarLong(long1)
    data.writeVarLong(long2)
    data.writeVarLong(long3)
    data.pos = 0

    expect(data.readVarLong()).toEqual(long1)
    expect(data.readVarLong()).toEqual(long2)
    expect(data.readVarLong()).toEqual(long3)
  })
})

describe('Magic', () => {
  it('reads magic correctly', () => {
    const buf = Buffer.from(Protocol.MAGIC, 'binary')
    const data = new BinaryData(buf)

    expect(data.readMagic()).toEqual(Protocol.MAGIC)
  })
  it('writes magic correctly', () => {
    const data = new BinaryData()
    data.writeMagic()

    data.pos = 0

    expect(data.readMagic()).toEqual(Protocol.MAGIC)
  })
})

describe('Addresses', () => {
  // it('reads address correctly', () => {
  //   const buf = Buffer.from(Protocol.MAGIC, 'binary')
  //   const data = new BinaryData(buf)

  //   expect(data.readMagic()).toEqual(Protocol.MAGIC)
  // })
  it('writes magic correctly', () => {
    const address = { ip: '83.1.157.191', port: 45012, family: 4 }

    const data = new BinaryData()
    data.writeAddress(address)

    data.pos = 0

    expect(data.readAddress()).toEqual(address)
  })
})

describe('Strings', () => {
  it('reads strings correctly', () => {
    const str = 'this is a test'

    const buf = Buffer.alloc(str.length + 1)
    buf[0] = str.length
    Buffer.from(str).copy(buf, 1)
    const data = new BinaryData(buf)

    expect(data.readString()).toEqual(str)
  })
  it('writes short strings correctly', () => {
    const str = 'this is a test'

    const data = new BinaryData()
    data.writeString(str)

    data.pos = 0

    expect(data.readString()).toEqual(str)
  })
  it('writes long strings correctly', () => {
    const str = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'

    const data = new BinaryData()
    data.writeString(str)

    data.pos = 0

    expect(data.readString()).toEqual(str)
  })
})

describe('All together now!', () => {
  it('works', () => {
    const byte = 6
    const short = 69
    const long = 925686942n
    const str = 'this is a test'

    const data = new BinaryData()

    data.writeByte(byte)
    data.writeShort(short)
    data.writeLong(long)
    data.writeMagic()
    data.writeString(str)
    data.writeMagic()
    data.writeLong(long)
    data.writeShort(short)
    data.writeByte(byte)

    data.pos = 0

    expect(data.readByte()).toEqual(byte)
    expect(data.readShort()).toEqual(short)
    expect(data.readLong()).toEqual(long)
    expect(data.readMagic()).toEqual(Protocol.MAGIC)
    expect(data.readString()).toEqual(str)
    expect(data.readMagic()).toEqual(Protocol.MAGIC)
    expect(data.readLong()).toEqual(long)
    expect(data.readShort()).toEqual(short)
    expect(data.readByte()).toEqual(byte)
  })
})
