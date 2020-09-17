import { Tag, TagType } from './Tag'

export class ListTag extends Tag {

  constructor(name: string, public valueType: TagType, public value: Tag[]) {
    super(TagType.List, name)
  }

}