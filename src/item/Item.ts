import { Items } from '../types/world'
import { CompoundTag } from '../nbt/CompoundTag'
import LegacyIdMap from '../data/legacy_id_map.json'

export class Item {

  public id: Items

  private damageVal = 0

  public count = 1

  public nbt: CompoundTag | null = null

  /**
   * @description Registers a new Item
   */
  constructor(public name: string, id?: Items, rawDamage = 0) {
    this.id = typeof id !== 'undefined' ? id : (LegacyIdMap as any)[this.name]
    this.damage = rawDamage
  }

  public get damage(): number {
    return this.damageVal
  }

  public set damage(val: number) {
    this.damageVal = val === -1 ? -1 : val & 0x7FFF
  }

  public clone(): Item {
    const item = new Item(this.name, this.id, 0)
    item.damageVal = this.damageVal

    return item
  }

}
