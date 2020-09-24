import { Tag, TagType } from './Tag'

export class IntTag extends Tag<number> {

  constructor() {
    super(TagType.Int)
  }

  public readValue(data: any): number {
    return this.value = data.readVarInt()
  }

}