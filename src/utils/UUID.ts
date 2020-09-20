import { v4 as genRandom } from 'uuid'
import { BinaryData } from './BinaryData'

export class UUID {

  public readonly parts: number[]

  constructor(p1: number, p2: number, p3: number, p4: number, private _string: string | null = null) {
    this.parts = [ p1, p2, p3, p4 ]
  }

  public toString(): string {
    if(this._string) return this._string

    const data = new BinaryData()
    data.writeLInt(this.parts[0])
    data.writeLInt(this.parts[1])
    data.writeLInt(this.parts[2])
    data.writeLInt(this.parts[3])

    const str = data.buf.toString('hex')
    const parts = []
    parts.push(str.substr(0, 8))
    parts.push(str.substr(8, 4))
    parts.push(str.substr(12, 4))
    parts.push(str.substr(16, 4))
    parts.push(str.substr(20, 12))

    return this._string = parts.join('-')
  }

  public static random(): UUID {
    return UUID.fromString(genRandom())
  }

  public static fromString(uuid: string): UUID {
    const data = new BinaryData(Buffer.from(uuid.replace(/-/g, ''), 'hex'))

    return new UUID(
      data.readLInt(),
      data.readLInt(),
      data.readLInt(),
      data.readLInt(),
      uuid,
    )
  }


}
