import { Item } from '../item/Item'
import { ItemMap } from '../item/ItemMap'
import LegacyIdMap from '../data/legacy_id_map.json'

export abstract class Block {

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
    return this.id
  }

  public clone<T extends Block = this>(): T {
    const copy = new (this.constructor as { new (): T })()
    Object.assign(copy, this)
    return copy
  }

}