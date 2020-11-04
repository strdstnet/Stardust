export enum BlockFace {
  BOTTOM = 0,
  UP = 1,
  SOUTH = 2,
  NORTH = 3,
  EAST = 4,
  WEST = 5,
}

export class Block {

  public id: number
  protected _item: Item

  private metaVal: number

  constructor(
    public name: string,
    meta = 0,
    id?: number,
    public hardness = 0,
    protected itemName: string = name,
    public fromEdu = false,
    public toolType = BlockToolType.NONE,
  ) {
    this.id = typeof id === 'undefined' ? BlockMap.getId(name) : id
    this.metaVal = meta

    let item = ItemMap.get(itemName)

    if(!item) {
      Server.logger.as('Block').error(`Couldn't find valid item: ${itemName}`)
      item = new Item(this.itemName, this.id)
    }

    this.item = item
    this.item.meta = this.metaVal
  }

  public get meta(): number {
    return this.metaVal
  }

  public set meta(val: number) {
    this.metaVal = val
    this.item.meta = val
  }

  // TODO: Actually implement
  // https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/block/Block.php#L105-L105
  public get runtimeId(): number {
    const state = BlockMap.legacyToRuntime.get((this.id << 4) | this.meta) ||
      BlockMap.legacyToRuntime.get(this.id << 4) ||
      BlockMap.legacyToRuntime.get(BlockIds.UPDATE_BLOCK << 4)

    if(!state) throw new Error('o')

    return state
  }

  public get breakTime(): number {
    return this.hardness * 1.5
  }

  public get toolHarvestLevel(): number {
    return 0 // TODO
  }

  public getItemBreakTime(item: Item): number {
    let base = this.hardness

    if(item.compatibleWith(this)) base *= 1.5
    else base *= 5

    if(item instanceof Tool) base /= item.miningEfficiency

    return base
  }

  public clone(): Block {
    const copy = new (this.constructor as { new (...args: any[]): Block })(
      this.name, this.metaVal, this.id,
      this.hardness, this.itemName, this.fromEdu,
    )
    Object.assign(copy, this)
    return copy
  }

  public static fromId(id: number): Block {
    const name = BlockMap.getName(id)

    if(!name) throw new Error(`Unable to create block from ID: ${id}`)

    return new Block(name)
  }

  public get item(): Item {
    return this._item.clone()
  }

  public set item(item: Item) {
    this._item = item
  }

}

import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import { BlockMap } from './BlockMap'
import { BlockIds } from './types'
import { Server } from '../Server'
import { BlockToolType, Tool } from '../item/Tool'

