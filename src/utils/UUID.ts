import { v4 as genRandom } from 'uuid'
import { BinaryData } from './BinaryData'

export class UUID {

  private readonly uuid: string
  public readonly data: BinaryData
  public readonly parts: number[]

  constructor(uuid: string) {
    this.uuid = uuid

    this.data = new BinaryData(Buffer.from(uuid.replace(/-/g, ''), 'hex'))

    this.parts = [
      this.data.readInt(),
      this.data.readInt(),
      this.data.readInt(),
      this.data.readInt(),
    ]
  }

  public static random(): UUID {
    return new UUID(genRandom())
  }

  public toString(): string {
    return this.uuid
  }

}
