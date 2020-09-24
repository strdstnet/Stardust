import { Tag, TagType } from './Tag'

export class ByteTag extends Tag<number> {

  constructor() {
    super(TagType.Byte)
  }

  public readValue(data: any): number {
    return this.value = data.readByte()
  }

}