import { Items } from '../types/world'
import { CompoundTag } from '../nbt/CompoundTag'
import LegacyIdMap from '../data/block_id_map.json'

export class Item {

  public id: Items

  public count = 1

  public nbt: CompoundTag | null = null

  /**
   * @description Registers a new Item
   */
  constructor(public name: string, id?: Items, public meta = 0, public maxCount = 64) {
    this.id = typeof id !== 'undefined' ? id : (LegacyIdMap as any)[this.name]
  }

  public get canStack(): boolean {
    return true
  }

  public get damage(): number {
    return this.meta
  }

  public set damage(val: number) {
    this.meta = val === -1 ? -1 : val & 0x7FFF
  }

  public clone(): Item {
    const item = new Item(this.name, this.id, 0)
    item.damageVal = this.damageVal

    return item
  }

}
