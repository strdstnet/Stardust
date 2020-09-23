import { Block } from './Block'
import { BlockNames } from './types'

export class Dirt extends Block {

  constructor(damage = 0) {
    super(BlockNames.DIRT, damage)
  }

  public get runtimeId(): number {
    return 2988
  }

}