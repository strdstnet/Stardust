import { Tag, TagType } from './Tag'

export class ListTag<T extends Tag = Tag> extends Tag<T[]> {

  public valueType: TagType = TagType.Byte

  constructor() {
    super(TagType.List)
  }

  public assign(name: string, value: T[], valueType?: TagType): this {
    super.assign(name, value)

    if(typeof valueType !== 'undefined') this.valueType = valueType

    return this
  }

  public readValue(data: BinaryData): T[] {
    const items: T[] = []
    this.valueType = data.readByte()
    const count = data.readVarInt()

    if(count > 0) {
      for(let i = 0; i < count; i++) {
        const tag = TagMapper.get(this.valueType)
        tag.readValue(data)

        items.push(tag as T)
      }
    } else {
      this.valueType = TagType.End
    }

    return this.value = items
  }

  public writeValue(data: BinaryData): void {
    data.writeByte(this.value.length < 1 ? TagType.End : this.valueType)
    data.writeByte(this.value.length)

    for(const tag of this.value) {
      data.writeTag(tag)
    }
  }

}

import { BinaryData } from '../utils/BinaryData'
import { TagMapper } from './TagMapper'
