export abstract class Container {

  public static MAX_STACK = 64

  public items: Item[]

  constructor(public id: number, public type: ContainerType = ContainerType.CONTAINER, items: Item[] = [], protected name = 'Container', protected size = 0) {
    this.items = []
    for(let i = 0; i < this.size; i++) {
      this.items[i] = items[i] || ItemMap.AIR
    }
  }

  public get maxStackSize(): number {
    return Container.MAX_STACK
  }

  public set(index: number, item: Item): void {
    this.items[index] = item
  }

  public add(item: Item): number {
    const index = this.items.findIndex(i => i.id === Items.AIR || (i.id === item.id && i.count < i.maxCount))

    if(index < 0) throw new Error('No inventory space free')

    const existing = this.get(index)

    if(existing && existing.id !== Items.AIR) {
      existing.count++
    } else {
      this.set(index, item)
    }

    return index
  }

  public get(index: number): Item {
    const item = this.items[index]

    return item || null
  }

}

import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import { ContainerType } from '../types/containers'
import { Items } from '../types/world'

