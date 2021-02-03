import { Item } from '../item/Item'
import { Server } from '../Server'
import { Entity } from './Entity'

export class DroppedItem extends Entity {

  protected gravity = 0.04
  protected drag = 0.02

  public baseOffset = 0.125

  public age = 0

  protected doPhysics = true

  constructor(public item: Item, public pickupDelay: number, public fromFishing = false) {
    super('Dropped Item', 'minecraft:item', [0.25, 0.25])

    this.immobile = true
  }

  public async onTick(): Promise<void> {
    await super.onTick()

    if(this.pickupDelay > 0) this.pickupDelay--
  }

  public get canPickUp(): boolean {
    return this.pickupDelay <= 0
  }

}
