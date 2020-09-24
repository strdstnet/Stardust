export class Block {

  public id: number
  public item: Item

  constructor(
    public name: string,
    public meta = 0,
    id?: number,
    item?: Item,
  ) {
    this.id = typeof id !== 'undefined' ? id : (LegacyIdMap as any)[this.name]
    this.item = item || ItemMap.get(this.name) || ItemMap.AIR
  }

  // TODO: Actually implement
  // https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/block/Block.php#L105-L105
  public get runtimeId(): number {
    const state = BlockMap.legacyToRuntime.get((this.id << 4) | this.meta) ||
      BlockMap.legacyToRuntime.get(this.id << 4) ||
      BlockMap.legacyToRuntime.get(BlockIds.UPDATE_BLOCK << 4)

    // console.log('STATE', state)
    // if(!process.po) process.exit()

    if(!state) throw new Error('o')

    return state
  }

  public get breakTime(): number {
    return 10
  }

  public clone<T extends Block = this>(): T {
    const copy = new (this.constructor as { new (): T })()
    Object.assign(copy, this)
    return copy
  }

  public static fromId(id: number): Block {
    const name = BlockMap.getName(id)

    if(!name) throw new Error(`Unable to create block from ID: ${id}`)

    return new Block(name)
  }

}

import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import LegacyIdMap from '../data/block_id_map.json'
import { BlockMap } from './BlockMap'
import { BlockIds } from './types'
