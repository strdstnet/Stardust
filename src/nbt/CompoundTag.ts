import { Tag, TagType } from './Tag'

export class CompoundTag extends Tag {

  public value: Map<string, Tag> = new Map()

  constructor(name?: string) {
    super(TagType.Compound, name)
  }

  public add(tag: Tag): void {
    this.value.set(tag.name, tag)
  }

  public get(name: string): Tag | null {
    return this.value.get(name) || null
  }

  public toJSON(): any {
    return {
      type: this.type,
      name: this.name,
      value: Array.from(this.value),
    }
  }

}