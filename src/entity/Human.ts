import { Attribute, Attr } from './Attribute'
import { Creature } from './Creature'
import { Armor } from '../containers/Armor'
import { Container } from '../containers/Container'
import { EnderChest } from '../containers/EnderChest'
import { Inventory } from '../containers/Inventory'

type HumanContainers = [Inventory, EnderChest, Armor, ...Container[]]

export class Human<Events, Containers extends Container[] = []> extends Creature<Events, [...HumanContainers, ...Containers]> {

  protected initContainers(): void {
    super.initContainers()

    this.containers.push(new Inventory())
    this.containers.push(new EnderChest())
  }

  protected addAttributes(): void {
    super.addAttributes()

    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.SATURATION))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXHAUSTION))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.HUNGER))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXPERIENCE_LEVEL))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.EXPERIENCE))
  }

  public get inventory(): Inventory {
    return this.containers[1]
  }

  public get enderChest(): EnderChest {
    return this.containers[2]
  }

}