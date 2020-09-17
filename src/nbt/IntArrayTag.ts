import { Tag, TagType } from './Tag'

export class IntArrayTag extends Tag {

  constructor(name: string, public value: number[]) {
    super(TagType.IntArray, name)
  }

}