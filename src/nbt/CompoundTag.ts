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

  public writeValue(data: BinaryData): void {
    for(const tag of Object.values(this.value)) {
      data.writeTag(tag)
    }
    data.writeTag(new EndTag())
  }

  public equals(tag: CompoundTag): boolean {
    const selfVal = this.value
    const tagVal = tag.value
    const selfProps = Object.getOwnPropertyNames(selfVal)
    const tagProps = Object.getOwnPropertyNames(tagVal)

    if(selfProps.length != tagProps.length) return false

    for(let i = 0; i < selfProps.length; i++) {
      const propName = selfProps[i]

      const v1 = selfVal[propName]
      const v2 = tagVal[propName]

      if(v1 instanceof CompoundTag && v2 instanceof CompoundTag) {
        const eq = v1.equals(v2)
        if(!eq) {
          return false
        }
      } else if(v1 instanceof Tag && v2 instanceof Tag) {
        if(v1.value !== v2.value) {
          return false
        }
      } else if(selfVal[propName] !== tagVal[propName]) {
        return false
      }
    }

    return true
  }

  public clone(): CompoundTag<V> {
    const tag = new CompoundTag<V>()
    tag.value = Object.assign({}, this.value)

    return tag
  }

}

import { BinaryData } from '../utils/BinaryData'
import { EndTag } from './EndTag'
