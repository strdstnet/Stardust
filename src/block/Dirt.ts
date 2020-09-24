import { Block } from './Block'

export class Dirt extends Block {

  constructor(damage = 0) {
    super(BlockNames.DIRT, damage)
  }

}

import { BlockNames } from './types'
