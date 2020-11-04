import { Item } from '../item/Item';
import { Entity } from './Entity'
import { Living } from './Living';

export class DroppedItem extends Entity {

  protected gravity = 0.04
  protected drag = 0.02

  public baseOffset = 0.125

  public age = 0

  constructor(public item: Item) {
    super('Dropped Item', 'minecraft:item', [0.25, 0.25])
  }
}