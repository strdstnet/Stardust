import { Tag, TagType } from './Tag'

export class CompoundTag<V extends Record<string, Tag> = {
  [k: string]: Tag,
}> extends Tag {

  public value: V = {} as V

  constructor(name?: string) {
    super(TagType.Compound, name)
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

}