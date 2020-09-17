import { Tag, TagType } from './Tag'

export class ByteArrayTag extends Tag {

  constructor(name: string, public value: number[]) {
    super(TagType.ByteArray, name)
  }

}