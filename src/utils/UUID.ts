import { v4 as genRandom } from 'uuid'

export class UUID {

  private readonly uuid: string
  public readonly parts: number[]

  constructor(uuid: string) {
    this.uuid = uuid
    this.parts = this.uuid.split('-').map(part => parseInt(part, 10))
  }

  public static random(): UUID {
    return new UUID(genRandom())
  }

  public toString(): string {
    return this.uuid
  }

}
