import { Tag, TagType } from './Tag'

export class EndTag extends Tag {

  constructor(name: string) {
    super(TagType.End, name)
  }

}