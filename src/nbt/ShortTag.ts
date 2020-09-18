import { Tag, TagType } from './Tag'

export class ShortTag extends Tag {

  constructor(name: string, public value: number) {
    super(TagType.Short, name)
  }

}