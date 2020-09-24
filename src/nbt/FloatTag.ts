import { Tag, TagType } from './Tag'

export class FloatTag extends Tag<number> {

  constructor() {
    super(TagType.Float)
  }

  public readValue(data: any): number {
    return this.value = data.readLFloat()
  }

}