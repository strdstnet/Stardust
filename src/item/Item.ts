import { EventEmitter } from 'events'
import { CompoundTag } from '@strdst/utils.nbt'
import { IItem, ItemIDs, ItemIsDurable } from '@strdstnet/utils.binary'

export interface IUseOnEntity {
  damage: number,
}

export class Item extends EventEmitter implements IItem {

  [ItemIsDurable] = false

  public count = 1

  public nbt?: CompoundTag = undefined

  public baseDamage = 1

  constructor(public name: string, public id: number, public meta = 0, public maxCount = 64) {
    super()
  }

  public get runtimeId(): number {
    const state = BlockMap.legacyToRuntime.get((this.id << 4) | this.meta) ||
      BlockMap.legacyToRuntime.get(this.id << 4) ||
      BlockMap.legacyToRuntime.get(ItemIDs.UPDATE_BLOCK << 4)

    if(!state) throw new Error('o')

    return state
  }

  public get canStack(): boolean {
    return true
  }

  public get damage(): number {
    return this.meta
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

  public compatibleWith(block: Block): boolean {
    if(block.hardness < 0) return false

    if(this instanceof Tool) {
      const type = this.blockType
      const lvl = this.harvestLevel

      return lvl === 0 || (type === block.toolType && lvl >= block.toolHarvestLevel)
    }

    return true
  }

}

import { BlockMap } from '../block/BlockMap'
import { Block } from '../block/Block'
import { Tool } from './Tool'

