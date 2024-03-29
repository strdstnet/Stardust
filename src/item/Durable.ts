import { ItemIsDurable } from '@strdstnet/utils.binary'
import { CompoundTag, IntTag } from '@strdst/utils.nbt'
import { Item } from './Item'

export abstract class Durable extends Item {

  [ItemIsDurable] = true

  public nbt?: CompoundTag<{
    Damage: IntTag,
  }> = undefined

  constructor(
    name: string,
    protected baseDurability: number,
    damage?: number,
  ) {
    super(name, damage, 1)
  }

  public get maxDurability(): number {
    // TODO: Check enchantments etc
    return this.baseDurability
  }

  public set damage(val: number) {
    this.meta = val
  }

  public get health(): number {
    return this.maxDurability - this.damage
  }

  public set health(val: number) {
    this.damage = (this.maxDurability - val)
  }

  public get broken(): boolean {
    return this.damage >= this.maxDurability
  }

}
