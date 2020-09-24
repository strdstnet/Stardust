import { Block } from './Block'

export class Grass extends Block {

  constructor(damage = 0) {
    super(BlockNames.GRASS, damage)
  }

}

import { BlockNames } from './types'
