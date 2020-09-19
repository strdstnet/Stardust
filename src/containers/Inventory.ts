import { Item } from '../item/Item'
import { ContainerType } from '../types/containers'
import { Container } from './Container'

export class Inventory extends Container {

  protected defaultName = 'Inventory'
  protected defaultSize = 36

  protected defaultHotbarSize = 9

  public hotbarSize: number
  public itemInHand = 0 // Index of item in hotbar, 0-{hotbarSize}

  constructor(hotbarSize?: number) {
    super(ContainerType.ARMOR, [], 'Inventory', 36)

    this.hotbarSize = hotbarSize || this.defaultHotbarSize
  }

  public get itemHolding(): Item {
    return this.getItem(this.itemInHand)
  }

}
