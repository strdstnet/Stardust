export enum BlockFace {
  BOTTOM = 0,
  UP = 1,
  SOUTH = 2,
  NORTH = 3,
  EAST = 4,
  WEST = 5,
}

export class Block {

  protected _item: Item

  private metaVal: number

  constructor(
    public nid: string,
    meta = 0,
    public hardness = 0,
    protected itemNID: string = nid,
    public fromEdu = false,
    public toolType = BlockToolType.NONE,
    public waterLogged = false,
  ) {
    this.metaVal = meta

    let item = ItemMap.get(itemNID)

    if(!item) {
      Server.logger.as('Block').error(`Couldn't find valid item: ${itemNID}`)
      item = new Item(this.itemNID, this.meta)
    }

    this._item = item
    this._item.meta = this.meta
  }

  /** @deprecated Use Block.nid instead (namespaced ID) */
  public get name(): string {
    return this.nid
  }

  public get meta(): number {
    return this.metaVal
  }

  public set meta(val: number) {
    this.metaVal = val
    this.item.meta = val
  }

  public get rid(): number {
    const rid = BlockRuntimes.getRID(this.nid, this.meta)

    if(typeof rid === 'undefined') throw new Error(`Could not find a suitable RID for NID ${this.nid}`)

    return rid
  }

  /** @deprecated Use Block.rid instead */
  public get runtimeId(): number {
    return this.rid
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
      this.nid, this.metaVal,
      this.hardness, this.itemNID, this.fromEdu,
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
import { Server } from '../Server'
import { BlockToolType, Tool } from '../item/Tool'
import { BlockRuntimes } from '@strdstnet/utils.binary'
