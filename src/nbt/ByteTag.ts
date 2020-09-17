import { Tag, TagType } from './Tag'

export class ByteTag extends Tag {

  constructor(name: string, public value: number) {
    super(TagType.Byte, name)
  }

}