import { IItemStack } from '@strdstnet/utils.binary'
import { EventEmitter } from '@strdstnet/utils.events'
import { Item } from './Item'
import { ItemMap } from './ItemMap'
import { ItemNames } from './types'

export const INVALID_STACK_COUNT = new Error('Invalid stack count')

export class ItemStack extends EventEmitter<any> implements IItemStack {

  private static NEXT_STACK_ID = 0

  public readonly id = ItemStack.NEXT_STACK_ID++

  constructor(
    private _item: Item,
    private _count: number,
    private _maxCount = _item.maxCount,
  ) {
    super()
  }

  public static get empty() {
    return new ItemStack(ItemMap.AIR, 1, 1)
  }

  public get empty() {
    return this.item.nid === ItemNames.AIR
  }

  public get item(): Item {
    return this._item
  }

  public get count(): number {
    return this._count
  }

  public get maxCount(): number {
    return this._maxCount
  }

  public set(item: Item) {
    this._item = item
    this._maxCount = item.maxCount
  }

  public add(count = 1) {
    if(count < 1 || this.count + count > this.maxCount) throw INVALID_STACK_COUNT

    this._count += count
  }

  public remove(count = 1) {
    if(count < 1) throw INVALID_STACK_COUNT

    this._count -= count

    if(this.count < 1) this.set(ItemMap.AIR)
  }

  public is(item: Item): boolean {
    return this.item.nid === item.nid && this.item.meta === item.meta
  }

  public full(): boolean {
    return this.count >= this.maxCount
  }

}
