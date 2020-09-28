import { Tag, TagType } from './Tag'

export class LongTag extends Tag<bigint> {

  constructor() {
    super(TagType.Long)
  }

  public readValue(data: BinaryData): bigint {
    return this.value = data.readVarLong()
  }

  public writeValue(data: BinaryData): void {
    data.writeVarLong(this.value)
  }

}

import { BinaryData } from '../utils/BinaryData'
