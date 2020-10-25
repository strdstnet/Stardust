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

    const grass = ItemMap.get('minecraft:grass')
    if(grass) grass.count = 64
    this.inventory.add(grass)
    this.inventory.add(ItemMap.get('minecraft:stone'))
    this.inventory.add(ItemMap.get('minecraft:dirt'))
    this.inventory.add(ItemMap.get('minecraft:netherite_sword'))
    this.inventory.add(ItemMap.get('minecraft:netherite_axe'))
    this.inventory.add(ItemMap.get('minecraft:netherite_shovel'))
    this.inventory.add(ItemMap.get('minecraft:diamond_sword'))
    this.inventory.add(ItemMap.get('minecraft:diamond_pickaxe'))
  }

  protected addAttributes(): void {
    super.addAttributes()

    this.setAttribute(Attribute.getAttribute(Attr.SATURATION))
    this.setAttribute(Attribute.getAttribute(Attr.EXHAUSTION))
    this.setAttribute(Attribute.getAttribute(Attr.HUNGER))
    this.setAttribute(Attribute.getAttribute(Attr.EXPERIENCE_LEVEL))
    this.setAttribute(Attribute.getAttribute(Attr.EXPERIENCE))
  }

  public exhaust(amount: number): void {
    let exhaustion = this.exhaustion
    exhaustion += amount

    while(exhaustion >= 4) {
      exhaustion -= 4

      let saturation = this.saturation

      if(saturation > 0) {
        saturation = Math.max(0, saturation - 1)
      } else {
        let food = this.food
        if(food > 0) {
          food--
          this.food = Math.max(food, 0)
        }
      }
    }
    this.exhaustion = exhaustion

    console.log(`EXAUSTION: ${this.exhaustion}`)
  }

  public get inventory(): Inventory {
    return this.containers[1]
  }

  public get enderChest(): EnderChest {
    return this.containers[2]
  }

  public get exhaustion(): number {
    return this.getAttributeValue(Attr.EXHAUSTION)
  }

  public set exhaustion(amount: number) {
    this.setAttribute(Attribute.getAttribute(Attr.EXHAUSTION, amount))
  }

  public get saturation(): number {
    return this.getAttributeValue(Attr.SATURATION)
  }

  public set saturation(amount: number) {
    this.setAttribute(Attribute.getAttribute(Attr.SATURATION, amount))
  }

  public get food(): number {
    return this.getAttributeValue(Attr.HUNGER)
  }

  public set food(amount: number) {
    this.setAttribute(Attribute.getAttribute(Attr.HUNGER, amount))
  }

}

import { Attribute, Attr } from './Attribute'
import { Armor } from '../containers/Armor'
import { Container } from '../containers/Container'
import { EnderChest } from '../containers/EnderChest'
import { Inventory } from '../containers/Inventory'
import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'

