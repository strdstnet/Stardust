import { Items } from '../types'
import { CompoundTag } from '../nbt'

export class Item {

  public static items: Map<Items, Item> = new Map()

  private damageVal = 0

  public count = 1

  public nbt: CompoundTag | null = null

  /**
   * @description Registers a new Item
   */
  constructor(public id: Items, rawDamage = 0, public name = 'Unknown') {
    this.damage = rawDamage
  }

  private static registerItem(id: Items) {
    this.items.set(id, new Item(id)) // tmp
  }

  public static registerItems(): void {
    Item.registerItem(Items.AIR)
  }

  public static getById(id: number): Item | null {
    const item = Item.items.get(id)

    return item ? item.clone() : null
  }

  public get damage(): number {
    return this.damageVal
  }

  public set damage(val: number) {
    this.damageVal = val === -1 ? -1 : val & 0x7FFF
  }

  public clone(): Item {
    const item = new Item(this.id, 0, this.name)
    item.damageVal = this.damageVal

    return item
  }

}
