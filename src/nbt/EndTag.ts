import { Tag, TagType } from './Tag'

export class EndTag extends Tag<null> {

  constructor() {
    super(TagType.End)
  }

  public assign(name: string): this {
    return super.assign(name, null)
  }

  public readValue(data: BinaryData): null {
    return this.value = null
  }

  public writeValue(data: BinaryData): void {}

}

import { BinaryData } from '../utils/BinaryData'
