import { BinaryData } from '../utils/BinaryData'
import { Tag, TagType } from './Tag'

export class ByteArrayTag extends Tag<number[]> {

  constructor() {
    super(TagType.ByteArray)
  }

  public readValue(data: BinaryData): number[] {
    return this.value = data.readBytes(data.readVarInt())
  }

}