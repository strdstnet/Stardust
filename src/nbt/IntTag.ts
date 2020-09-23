import { BinaryData } from '../utils/BinaryData'
import { Tag, TagType } from './Tag'

export class IntTag extends Tag<number> {

  constructor() {
    super(TagType.Int)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readVarInt()
  }

}