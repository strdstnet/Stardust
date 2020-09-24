import { Tag, TagType } from './Tag'

export class StringTag extends Tag<string> {

  constructor() {
    super(TagType.String)
  }

  public readValue(data: any): string {
    return this.value = data.readString()
  }

}