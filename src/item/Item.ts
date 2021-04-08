import { EventEmitter } from 'events'
import { CompoundTag } from '@strdst/utils.nbt'
import { IBlock, IItem, ItemIsDurable, ItemRuntimes } from '@strdstnet/utils.binary'

export interface IUseOnEntity {
  damage: number,
}

export class Item extends EventEmitter implements IItem {

  [ItemIsDurable] = false

  public nbt?: CompoundTag = undefined

  public baseDamage = 1

  constructor(public nid: string, public meta = 0, public maxCount = 64) {
    super()
  }

  public get rid(): number {
    const rid = ItemRuntimes.getRID(this.nid)

    if(typeof rid === 'undefined') throw new Error(`Could not find any suitable RID for NID ${this.nid} with meta ${this.meta}`)

    return rid
  }

  public get damage(): number {
    return this.meta
  }

  // TODO:
  public get block(): IBlock {
    return {
      rid: this.rid,
      nid: this.nid,
      meta: this.meta,
    }
  }

  public clone(): Item {
    return new Item(this.nid, this.meta, this.maxCount)
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

import { Block } from '../block/Block'
import { Tool } from './Tool'
