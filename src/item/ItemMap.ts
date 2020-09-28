import { Item } from './Item'
import ItemDefinition from './items.json'

export class ItemMap {

  private static items: Map<string, Item> = new Map()
  private static idToName: Map<number, string> = new Map()

  public static AIR: Item

  public static get count(): number {
    return this.items.size
  }

  public static add(item: Item): Item {
    this.items.set(item.name, item)
    this.idToName.set(item.id, item.name)

    return item
  }

  public static clear(): void {
    this.items.clear()
    this.idToName.clear()
  }

  public static get(name: string, clone = true): Item | null{
    const item = this.items.get(name)

    return item ? (clone ? item.clone() : item) : null
  }

  public static getById(id: number, clone = true): Item | null {
    const name = this.idToName.get(id)

    if(!name) return null

    return this.get(name, clone)
  }

  public static getName(id: number): string | null {
    return this.idToName.get(id) || null
  }

  private static registerItem(name: string, id: number): Item {
    const item = new Item(name, id)
    this.add(item)

    return item
  }

  public static async registerItems(): Promise<void> {
    this.clear()

    for await(const { name, id } of ItemDefinition.standard) {
      this.registerItem(name, id)
    }

    for await(const { defaults, items } of ItemDefinition.tools) {
      for await(const item of items) {
        const props = Object.assign({}, defaults, item) as any

        this.add(new Tool(
          item.name,
          props.blockType,
          props.entityDmg,
          props.blockDmg,
          props.miningMod || 1,
          props.harvestLvl,
          props.miningEff,
          props.attackPts,
          props.durability,
          item.id,
        ))
      }
    }

    this.AIR = this.get('minecraft:air', false) as Item
    // this.AIR = this.registerItem('minecraft:air', 0)
    // this.registerItem('minecraft:stone', 1)
    // this.registerItem('minecraft:grass', 2)
    // this.registerItem('minecraft:dirt', 3)
  }

}

import { Tool } from './Tool'
