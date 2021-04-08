import { Event, EventEmitter } from '@strdstnet/utils.events'

type ContainerEvents = {
  slotChanged: Event<{
    slot: number,
    stack: ItemStack,
  }>,
}

export abstract class Container extends EventEmitter<ContainerEvents> {

  constructor(
    public id: number,
    public type: ContainerType = ContainerType.CONTAINER,
    public stacks: ItemStack[],
    protected name = 'Container',
    protected size = 0,
  ) {
    super()

    for(let i = 0; i < this.size; i++) {
      this.stacks[i] = stacks[i] || ItemStack.empty
    }
  }

  public emitSlotChanged(slot: number, stack: ItemStack): void {
    this.emit('slotChanged', new Event({
      slot, stack,
    }))
  }

  public set(index: number, stack: ItemStack): void {
    this.stacks[index] = stack

    this.emitSlotChanged(index, stack)
  }

  public add(item: Item | null, count = 1) {
    if(!item) return -1 // We allow null here just for convenience

    const index = this.stacks.findIndex(stack =>
      stack.empty || (stack.is(item) && !stack.full()))

    if(index < 0) throw new Error('No inventory space free')

    const stack = this.get(index)

    if(stack && !stack.empty) {
      const addCount = Math.max(stack.maxCount, stack.count + count)

      stack.add(addCount)

      if(addCount < count) this.add(item, count - addCount)

      this.emitSlotChanged(index, stack)
    } else {
      this.set(index, new ItemStack(item, count))
    }
  }

  public get(index: number): ItemStack {
    return this.stacks[index]
  }

  public clear(): void {
    for(let i = 0; i < this.size; i++) {
      this.set(i, ItemStack.empty)
    }
  }

}

import { Item } from '../item/Item'
import { ItemStack } from '../item/ItemStack'
import { ContainerType } from '../types/containers'
