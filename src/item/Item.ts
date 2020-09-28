import { EventEmitter } from 'events'

export interface IUseOnEntity {
  damage: number,
}

export class Item extends EventEmitter {

  public count = 1

  public nbt: CompoundTag | null = null

  public baseDamage = 1

  constructor(public name: string, public id: number, public meta = 0, public maxCount = 64) {
    super()
  }

  public get runtimeId(): number {
    const state = BlockMap.legacyToRuntime.get((this.id << 4) | this.meta) ||
      BlockMap.legacyToRuntime.get(this.id << 4) ||
      BlockMap.legacyToRuntime.get(BlockIds.UPDATE_BLOCK << 4)

    if(!state) throw new Error('o')

    return state
  }

  public get canStack(): boolean {
    return true
  }

  public clone(): Item {
    return new Item(this.name, this.id, this.meta, this.maxCount)
  }

  public useOnBlock(): void {}

  public useOnEntity(): IUseOnEntity | null {
    return {
      damage: this.baseDamage,
    }
  }

}

import { CompoundTag } from '../nbt/CompoundTag'
import { BlockMap } from '../block/BlockMap'
import { BlockIds } from '../block/types'
