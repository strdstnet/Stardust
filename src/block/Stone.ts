import { Block } from './Block'

export class Stone extends Block {

  constructor(damage = 0) {
    super(BlockNames.STONE, damage)
  }

}

import { BlockNames } from './types'
