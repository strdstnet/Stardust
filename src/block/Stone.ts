import { Block } from './Block'

export class Stone extends Block {

  constructor(damage = 0) {
    super(BlockNames.STONE, damage)
  }

  public get breakTime(): number {
    return 2250
  }

}

import { BlockNames } from './types'
