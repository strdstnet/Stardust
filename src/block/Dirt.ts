import { Block } from './Block'

export class Dirt extends Block {

  constructor(damage = 0) {
    super(BlockNames.DIRT, damage)
  }

  public get breakTime() {
    return 0.5
  }

}

import { BlockNames } from './types'
