import { Tag, TagType } from './Tag'

export class StringTag extends Tag {

  constructor(name: string, public value: string) {
    super(TagType.String, name)
  }

}