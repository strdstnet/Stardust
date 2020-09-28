import { Tag, TagType } from './Tag'

export class ByteTag extends Tag<number> {

  constructor() {
    super(TagType.Byte)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readByte()
  }

  public writeValue(data: BinaryData): void {
    data.writeByte(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
