import { Block } from './Block'

export class Air extends Block {

  constructor() {
    super(BlockNames.AIR, 0, Items.AIR)
  }

}

import { BlockNames } from './types'
import { Items } from '../types/world'
