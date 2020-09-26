import { Block } from './Block'

export class Grass extends Block {

  constructor(damage = 0) {
    super(BlockNames.GRASS, damage)
  }

  public get breakTime(): number {
    // return 900
    return 200
  }

}

import { BlockNames } from './types'
