import { Items } from '../types/world'
import { Block } from './Block'
import { BlockNames } from './types'

export class Air extends Block {

  constructor() {
    super(BlockNames.AIR, 0, Items.AIR)
  }

}