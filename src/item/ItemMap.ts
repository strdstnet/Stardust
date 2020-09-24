import { Items } from '../types/world'
import { Item } from './Item'
import { ItemNames } from './types'

export class ItemMap {

  private static items: Map<string, Item> = new Map()
  private static idToName: Map<Items, string> = new Map()

  public static AIR: Item

  public static add(item: Item): Item {
    this.items.set(item.name, item)
    this.idToName.set(item.id, item.name)

    return item
  }

  public static clear(): void {
    this.items.clear()
    this.idToName.clear()
  }

  public static get(name: string): Item | null {
    const item = this.items.get(name)

    return item ? item.clone() : null
  }

  public static getById(id: number): Item | null {
    const name = this.idToName.get(id)

    if(!name) return null

    const item = this.items.get(name)

    return item ? item.clone() : null
  }

  public static getName(id: number): string | null {
    return this.idToName.get(id) || null
  }

  private static registerItem(name: string, id: Items): Item {
    const item = new Item(name, id)
    this.add(item)

    return item
  }

  public static registerItems(): void {
    this.clear()

    this.AIR = this.registerItem(ItemNames.AIR, Items.AIR)
    this.registerItem(ItemNames.STONE, Items.STONE)
    this.registerItem(ItemNames.GRASS, Items.GRASS)
    this.registerItem(ItemNames.DIRT, Items.DIRT)
  }

}