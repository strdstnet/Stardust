import { Tag, TagType } from './Tag'

export class IntTag extends Tag {

  constructor(name: string, public value: number) {
    super(TagType.Int, name)
  }

}