import { Item } from '../item/Item'
import { Items } from '../types'

export enum InventoryType {
  NONE = -1,
	INVENTORY = 0,
	FIRST = 1,
	LAST = 100,
	OFFHAND = 119,
	ARMOR = 120,
	HOTBAR = 122,
	FIXED_INVENTORY = 123,
	UI = 124,
}

export abstract class Inventory {

  public static MAX_STACK = 64

  public name: string
  public size: number
  public items: Item[]

  protected defaultName = 'Inventory'
  protected defaultSize = 0

  constructor(public type: InventoryType, items: Item[] = [], size?: number, name?: string) {
    this.name = name || this.defaultName
    this.size = size || this.defaultSize

    this.items = new Array(this.size)
      .fill(null)
      .map((_, index) => items[index] || Item.getById(Items.AIR))
  }

  public get maxStackSize(): number {
    return Inventory.MAX_STACK
  }

  public getItem(index: number): Item {
    const item = this.items[index]

    return item || null
  }

}