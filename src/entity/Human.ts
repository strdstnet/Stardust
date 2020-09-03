import { Creature } from './Creature'
import { Attribute, Attr } from './Attribute'

export class Human<Events> extends Creature<Events> {

  protected addAttributes(): void {
    super.addAttributes()

    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.SATURATION))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXHAUSTION))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.HUNGER))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXPERIENCE_LEVEL))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXPERIENCE))
  }

}