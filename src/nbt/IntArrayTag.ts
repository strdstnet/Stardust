import { Tag, TagType } from './Tag'

export class IntArrayTag extends Tag<number[]> {

  constructor() {
    super(TagType.IntArray)
  }

  public readValue(data: BinaryData): number[] {
    const value = []
    const count = data.readVarInt()

    for(let i = 0; i < count; i++) {
      value.push(data.readVarInt())
    }

    return this.value = value
  }

  public writeValue(data: BinaryData): void {
    data.writeVarInt(this.value.length)

    for(const val of this.value) {
      data.writeVarInt(val)
    }
  }

}

import { BinaryData } from '../utils/BinaryData'
