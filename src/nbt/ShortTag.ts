import { Tag, TagType } from './Tag'

export class ShortTag extends Tag<number> {

  constructor() {
    super(TagType.Short)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readLShort()
  }

  public writeValue(data: BinaryData): void {
    data.writeLShort(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
