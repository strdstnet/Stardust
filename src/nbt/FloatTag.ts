import { Tag, TagType } from './Tag'

export class FloatTag extends Tag<number> {

  constructor() {
    super(TagType.Float)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readLFloat()
  }

  public writeValue(data: BinaryData): void {
    data.writeLFloat(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
