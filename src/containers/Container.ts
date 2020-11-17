import { Event, EventEmitter } from '@hyperstonenet/utils.events'

type ContainerEvents = {
  slotChanged: Event<{
    slot: number,
    item: Item,
  }>,
}

export abstract class Container extends EventEmitter<ContainerEvents> {

  public static MAX_STACK = 64

  public items: Item[]

  constructor(public id: number, public type: ContainerType = ContainerType.CONTAINER, items: Item[] = [], protected name = 'Container', protected size = 0) {
    super()

    this.items = []
    for(let i = 0; i < this.size; i++) {
      this.items[i] = items[i] || ItemMap.AIR
    }
  }

  public get maxStackSize(): number {
    return Container.MAX_STACK
  }

  public emitSlotChanged(slot: number, item: Item): void {
    this.emit('slotChanged', new Event({
      slot, item,
    }))
  }

  public set(index: number, item: Item): void {
    this.items[index] = item

    this.emitSlotChanged(index, item)
  }

  public add(item: Item | null): number {
    if(!item) return -1 // We allow null here just for convenience

    const index = this.items.findIndex(i => i.id === Items.AIR || (i.id === item.id && i.meta === item.meta && i.canStack && item.canStack && i.count < i.maxCount))

    if(index < 0) throw new Error('No inventory space free')

    const existing = this.get(index)

    if(existing && existing.id !== Items.AIR) {
      existing.count++

      this.emitSlotChanged(index, existing)
    } else {
      this.set(index, item)
    }

    return index
  }

  public get(index: number): Item {
    const item = this.items[index]

    return item || null
  }

  public clear(): void {
    for(let i = 0; i < this.size; i++) {
      this.set(i, ItemMap.AIR)
    }
  }

}

import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import { ContainerType } from '../types/containers'
import { Items } from '../types/world'

