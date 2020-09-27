export enum ContainerId {
  NONE            = -1,
	INVENTORY       = 0,
	FIRST           = 1,
	LAST            = 100,
	OFFHAND         = 119,
	ARMOR           = 120,
	HOTBAR          = 122,
	FIXED_INVENTORY = 123,
	UI              = 124,
}

export enum ContainerType {
  NONE                = -9,
  INVENTORY           = -1,
  CONTAINER           = 0,
  WORKBENCH           = 1,
  FURNACE             = 2,
  ENCHANTMENT         = 3,
  BREWING_STAND       = 4,
  ANVIL               = 5,
  DISPENSER           = 6,
  DROPPER             = 7,
  HOPPER              = 8,
  CAULDRON            = 9,
  MINECART_CHEST      = 10,
  MINECART_HOPPER     = 11,
  HORSE               = 12,
  BEACON              = 13,
  STRUCTURE_EDITOR    = 14,
  TRADING             = 15,
  COMMAND_BLOCK       = 16,
  JUKEBOX             = 17,
  ARMOR               = 18,
  HAND                = 19,
  COMPOUND_CREATOR    = 20,
  ELEMENT_CONSTRUCTOR = 21,
  MATERIAL_REDUCER    = 22,
  LAB_TABLE           = 23,
  LOOM                = 24,
  LECTERN             = 25,
  GRINDSTONE          = 26,
  BLAST_FURNACE       = 27,
  SMOKER              = 28,
  STONECUTTER         = 29,
  CARTOGRAPHY         = 30,
  HUD                 = 31,
  JIGSAW_EDITOR       = 32,
  SMITHING_TABLE      = 33,
}

export enum ContainerActionSource {
  CONTAINER = 0,
  WORLD     = 2,
  CREATIVE  = 3,
  CLIENT    = 99999,
}

export enum ContainerTransactionType {
  NORMAL             = 0,
  MISMATCH           = 1,
  USE_ITEM           = 2,
  USE_ITEM_ON_ENTITY = 3,
  RELEASE_ITEM       = 4,
}

export enum UseItemType {
  CLICK_BLOCK = 0,
  CLICK_AIR   = 1,
  BREAK_BLOCK = 2,
}

export enum UseItemOnEntityType {
  INTERACT = 0,
  ATTACK   = 1,
}

export type TransactionType = UseItemType & UseItemOnEntityType

export interface ITransaction {
  type: TransactionType,
  position: Vector3,
  face?: number,
  hotbarSlot: number,
  itemHolding: Item,
  playerPos?: Vector3
  clickPos?: Vector3,
  blockRuntimeId?: number,
  entityRuntimeId?: bigint,
  headPos?: Vector3
}

import { Vector3 } from 'math3d'
import { Item } from '../item/Item'
