import { Creature } from './Creature'

type HumanContainers = [Inventory, EnderChest, Armor, ...Container[]]

export class Human<Events, Containers extends Container[] = []> extends Creature<Events, [...HumanContainers, ...Containers]> {

  public baseOffset = 1.62

  constructor(name: string, gameId: string) {
    super(name, gameId, [0.6, 1.8])
  }

  protected initContainers(): void {
    super.initContainers()

    this.containers.push(new Inventory())
    // this.containers.push(new EnderChest())

    const grass = new Item('minecraft:grass', 2, 0)
    grass.count = 64
    this.inventory.add(grass)
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

import { Attribute, Attr } from './Attribute'
import { Armor } from '../containers/Armor'
import { Container } from '../containers/Container'
import { EnderChest } from '../containers/EnderChest'
import { Inventory } from '../containers/Inventory'
import { Item } from '../item/Item'

