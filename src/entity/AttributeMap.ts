import { Attribute } from './Attribute'

export class AttributeMap {

  private map: Map<number, Attribute> = new Map()

  public dirty = false

  public setAttribute(attr: Attribute | null): void {
    if(!attr) return

    this.dirty = true

    this.map.set(attr.id, attr)
  }

  /** @deprecated Use AttributeMap.setAttribute instead */
  public addAttribute(attr: Attribute | null): void {
    this.setAttribute(attr)
  }

  public all(): Attribute[] {
    return Array.from(this.map.values())
  }

  public get(id: number): Attribute | null {
    return this.map.get(id) || null
  }

  public needSend(): Attribute[] {
    return Array.from(this.map)
      .filter(([, v]) => v.isDesynchronized())
      .map(([, v]) => v)
  }

}