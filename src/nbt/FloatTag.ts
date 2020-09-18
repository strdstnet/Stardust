import { Tag, TagType } from './Tag'

export class FloatTag extends Tag {

  constructor(name: string, public value: number) {
    super(TagType.Float, name)
  }

}