import { Tag, TagType } from './Tag'

export class ListTag<T extends Tag = Tag> extends Tag {

  constructor(name: string, public valueType: TagType, public value: T[]) {
    super(TagType.List, name)
  }

}