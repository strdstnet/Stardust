import { Tag, TagType } from './Tag'

export class ByteArrayTag extends Tag<number[]> {

  constructor() {
    super(TagType.ByteArray)
  }

  public readValue(data: BinaryData): number[] {
    return this.value = data.readBytes(data.readVarInt())
  }

  public writeValue(data: BinaryData): void {
    data.writeVarInt(this.value.length)

    for(const val of this.value) {
      data.writeByte(val)
    }
  }

}

import { BinaryData } from '../utils/BinaryData'
