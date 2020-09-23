import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import { ContainerType } from '../types/containers'

export abstract class Container {

  public static MAX_STACK = 64

  public items: Item[]

  constructor(public type: ContainerType = ContainerType.CONTAINER, items: Item[] = [], protected name = 'Container', protected size = 0) {
    this.items = []
    for(let i = 0; i < this.size; i++) {
      this.items[i] = items[i] || ItemMap.AIR
    }
  }

  public get maxStackSize(): number {
    return Container.MAX_STACK
  }

  public getItem(index: number): Item {
    const item = this.items[index]

    return item || null
  }

}
