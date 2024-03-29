import { IItemTableItem } from '@strdstnet/protocol'
import { IItem, Namespaced, ItemRuntimes } from '@strdstnet/utils.binary'
import { Item } from './Item'
import Tools from './tools.json'

export class ItemMap {

  private static items: Map<string, Item> = new Map()

  public static itemTable: IItemTableItem[] = []

  public static get AIR(): Item {
    return this.items.get(Namespaced.AIR) as Item
  }

  public static get count(): number {
    return this.items.size
  }

  public static add(item: Item): Item {
    this.items.set(item.nid, item)
    this.itemTable.push({
      nid: item.nid,
      rid: item.rid,
      component: false,
    })

    return item
  }

  private static clear(): void {
    this.items.clear()
    this.itemTable = []
  }

  public static from(iItem: IItem): Item | null {
    const item = ItemMap.get(iItem.nid)

    if(!item) return null

    item.meta = iItem.meta
    item.nbt = iItem.nbt

    return item
  }

  public static get(nid: string, clone = true): Item | null {
    const item = this.items.get(nid)

    return item ? (clone ? item.clone() : item) : null
  }

  private static registerItem(nid: string): Item {
    if(this.items.has(nid)) return this.items.get(nid) as Item

    const item = new Item(nid)
    this.add(item)

    return item
  }

  public static async registerItems(): Promise<void> {
    this.clear()

    for await(const { defaults, items } of Tools) {
      for await(const item of items) {
        const props = Object.assign({}, defaults, item) as any

        this.add(new Tool(
          item.nid,
          props.blockType,
          props.entityDmg,
          props.blockDmg,
          props.miningMod || 1,
          props.harvestLvl,
          props.miningEff,
          props.attackPts,
          props.durability,
        ))
      }
    }

    for await(const nid of Object.keys(ItemRuntimes.toRuntime)) {
      this.registerItem(nid)
    }
  }

}

import { Tool } from './Tool'
