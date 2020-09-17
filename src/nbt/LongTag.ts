import { Tag, TagType } from './Tag'

export class LongTag extends Tag {

  constructor(name: string, public value: bigint) {
    super(TagType.Long, name)
  }

}