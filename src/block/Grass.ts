import { Block } from './Block'
import { BlockNames } from './types'

export class Grass extends Block {

  constructor(damage = 0) {
    super(BlockNames.GRASS, damage)
  }

  public get runtimeId(): number {
    return 5715
  }

}