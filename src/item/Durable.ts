import { CompoundTag } from '../nbt/CompoundTag'
import { IntTag } from '../nbt/IntTag'
import { Item } from './Item'

export abstract class Durable extends Item {

  public nbt: CompoundTag<{
    Damage: IntTag,
  }> | null = null

  constructor(
    name: string,
    protected baseDurability: number,
    id: number,
    damage?: number,
  ) {
    super(name, id, damage, 1)
  }

  public get maxDurability(): number {
    // TODO: Check enchantments etc
    return this.baseDurability
  }

  public get damage(): number {
    return this.meta
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
