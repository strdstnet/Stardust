import { Tag, TagType } from './Tag'

export class EndTag extends Tag<null> {

  constructor() {
    super(TagType.End)
  }

  public assign(name: string): this {
    return super.assign(name, null)
  }

  public readValue(data: any): null {
    return this.value = null
  }

}