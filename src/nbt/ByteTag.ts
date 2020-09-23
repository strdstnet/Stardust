import { BinaryData } from '../utils/BinaryData'
import { Tag, TagType } from './Tag'

export class ByteTag extends Tag<number> {

  constructor() {
    super(TagType.Byte)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readByte()
  }

}