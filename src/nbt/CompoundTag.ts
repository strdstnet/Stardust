import { BinaryData } from '../utils/BinaryData'
import { EndTag } from './EndTag'
import { Tag, TagType } from './Tag'

export class CompoundTag<V extends Record<string, Tag> = {
  [k: string]: Tag,
}> extends Tag<V> {

  public value: V = {} as V

  constructor() {
    super(TagType.Compound)
  }

  public assign(name: string, value?: V): this {
    return super.assign(name, value || {} as V)
  }

  public add(tag: Tag): void {
    (this.value as any)[tag.name] = tag
  }

  public get<N extends keyof V>(name: N): V[N] {
    return this.value[name]
  }

  public val<N extends keyof V>(name: N): V[N]['value'] {
    return this.value[name] ? this.value[name].value : null
  }

  public readValue(data: BinaryData): V {
    this.value = {} as V

    let tag: Tag | null = null
    while(!(tag instanceof EndTag)) {
      if(tag) this.add(tag)

      tag = data.readTag()
    }

    return this.value
  }

}