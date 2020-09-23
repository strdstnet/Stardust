import { BinaryData } from '../utils/BinaryData'
import { Tag, TagType } from './Tag'

export class ShortTag extends Tag<number> {

  constructor() {
    super(TagType.Short)
  }

  public readValue(data: BinaryData): number {
    return this.value = data.readLShort()
  }

}