import { Durable } from './Durable'

export enum BlockToolType {
  NONE    = 0,
  SWORD   = 1,
  SHOVEL  = 2,
  PICKAXE = 4,
  AXE     = 8,
  SHEARS  = 16,
}

export class Tool extends Durable {

  constructor(
    name: string,
    public blockType: BlockToolType,
    protected damageOnEntity: number,
    protected damageOnBlock: number,
    protected baseMiningModifier: number,
    protected baseHarvestLevel: number,
    protected baseMiningEfficiency: number,
    protected baseAttackPoints: number,
    baseDurability: number,
    id: number,
    damage?: number,
  ) {
    super(name, baseDurability, id, damage)
  }

  public get attackPoints(): number {
    // TODO: Check enchantments etc
    return this.baseAttackPoints
  }

  public useOnEntity(): IUseOnEntity | null {
    this.damage -= this.damageOnEntity

    return {
      damage: this.attackPoints,
    }
  }

  public useOnBlock(): void {
    this.damage -= this.damageOnBlock
  }

  public clone(): Tool {
    return new Tool(
      this.name,
      this.blockType,
      this.damageOnEntity,
      this.damageOnBlock,
      this.baseMiningModifier,
      this.baseHarvestLevel,
      this.baseMiningEfficiency,
      this.baseAttackPoints,
      this.baseDurability,
      this.id,
      this.meta,
    )
  }

}

import { IUseOnEntity } from './Item'
