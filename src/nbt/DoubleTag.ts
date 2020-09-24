import { Tag, TagType } from './Tag'

export class DoubleTag extends Tag<number> {

  constructor() {
    super(TagType.Double)
  }

  public readValue(data: any): number {
    return this.value = data.readLDouble()
  }

}