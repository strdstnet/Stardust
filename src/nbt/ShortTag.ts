import { Tag, TagType } from './Tag'

export class ShortTag extends Tag<number> {

  constructor() {
    super(TagType.Short)
  }

  public readValue(data: any): number {
    return this.value = data.readLShort()
  }

}