import { Tag, TagType } from './Tag'

export class StringTag extends Tag<string> {

  constructor() {
    super(TagType.String)
  }

  public readValue(data: BinaryData): string {
    return this.value = data.readString()
  }

  public writeValue(data: BinaryData): void {
    data.writeString(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
