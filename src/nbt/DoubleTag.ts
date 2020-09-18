import { Tag, TagType } from './Tag'

export class DoubleTag extends Tag {

  constructor(name: string, public value: number) {
    super(TagType.Double, name)
  }

}