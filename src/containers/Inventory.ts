import { Container } from './Container'

export class Inventory extends Container {

  protected defaultName = 'Inventory'
  protected defaultSize = 36

  protected defaultHotbarSize = 9

  public hotbarSize: number
  public itemInHand = 0 // Index of item in hotbar, 0-{hotbarSize}

  constructor(id: number = ContainerId.INVENTORY, hotbarSize?: number) {
    super(id, ContainerType.ARMOR, [], 'Inventory', 36)

    this.hotbarSize = hotbarSize || this.defaultHotbarSize
  }

  public get itemHolding(): Item {
    return this.get(this.itemInHand)
  }

}

import { Item } from '../item/Item'
import { ContainerId, ContainerType } from '../types/containers'
