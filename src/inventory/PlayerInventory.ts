import { Inventory, InventoryType } from './Inventory'
import { Player } from '../Player'

export class PlayerInventory extends Inventory {

  protected defaultName = 'Player'
  protected defaultSize = 36

  constructor(public player: Player) {
    super(InventoryType.INVENTORY)
  }

}
