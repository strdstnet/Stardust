import { Tag, TagType } from './Tag'

export class LongArrayTag extends Tag {

  constructor(name: string, public value: bigint[]) {
    super(TagType.LongArray, name)
  }

}