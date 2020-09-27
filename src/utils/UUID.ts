import { v4 as genRandom } from 'uuid'

export class UUID {

  public readonly parts: number[]

  constructor(p1: number, p2: number, p3: number, p4: number, private _string: string | null = null) {
    this.parts = [ p1, p2, p3, p4 ]
  }

  public static randomStr(): string {
    return genRandom()
  }

  public static random(): UUID {
    return UUID.fromString(this.randomStr())
  }

  public static fromString(uuid: string): UUID {
    const data = Buffer.from(uuid.replace(/-/g, ''), 'hex')

    return new UUID(
      data.readInt32LE(0),
      data.readInt32LE(4),
      data.readInt32LE(8),
      data.readInt32LE(12),
      uuid,
    )
  }

}
