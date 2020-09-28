import { Tag, TagType } from './Tag'

export class LongArrayTag extends Tag<bigint[]> {

  constructor() {
    super(TagType.LongArray)
  }

  public readValue(data: BinaryData): bigint[] {
    throw new Error('not implemented')
  }

  public writeValue(data: BinaryData): void {
    throw new Error('not implemented')
  }

}

import { BinaryData } from '../utils/BinaryData'
