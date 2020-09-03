import { Attribute } from './Attribute'

export class AttributeMap extends Map<number, Attribute> {

  public addAttribute(attr: Attribute | null): void {
    if(!attr) return

    this.set(attr.id, attr)
  }

  public all(): Attribute[] {
    return Array.from(this.values())
  }

  public needSend(): Attribute[] {
    return Array.from(this)
      .filter(([, v]) => v.isDesynchronized())
      .map(([, v]) => v)
  }

}