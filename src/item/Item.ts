import { Items } from '../types/world'
import { CompoundTag } from '../nbt/CompoundTag'

export class Item {

  public static items: Map<Items, Item> = new Map()

  private damageVal = 0

  public count = 1

  public nbt: CompoundTag | null = null

  public static AIR: Item

  /**
   * @description Registers a new Item
   */
  constructor(public id: Items, public name = 'Unknown', rawDamage = 0) {
    this.damage = rawDamage
  }

  private static registerItem(id: Items, name?: string): Item {
    const item = new Item(id, name)
    this.items.set(id, item)

    return item
  }

  public static registerItems(): void {
    Item.AIR = Item.registerItem(Items.AIR, 'Air')
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
    const item = new Item(this.id, this.name, 0)
    item.damageVal = this.damageVal

    return item
  }

}
