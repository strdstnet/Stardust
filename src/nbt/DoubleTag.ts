import { Tag, TagType } from './Tag'

export class DoubleTag extends Tag<number> {

  constructor() {
    super(TagType.Double)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readLDouble()
  }

  public writeValue(data: BinaryData): void {
    data.writeDouble(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
