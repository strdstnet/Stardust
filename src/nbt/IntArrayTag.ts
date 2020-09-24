import { Tag, TagType } from './Tag'

export class IntArrayTag extends Tag<number[]> {

  constructor() {
    super(TagType.IntArray)
  }

  public readValue(data: any): number[] {
    const value = []
    const count = data.readVarInt()

    for(let i = 0; i < count; i++) {
      value.push(data.readVarInt())
    }

    return this.value = value
  }

}