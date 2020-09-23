import { Block } from './Block'
import { BlockNames } from './types'

export class Stone extends Block {

  constructor(damage = 0) {
    super(BlockNames.STONE, damage)
  }

  public get runtimeId(): number {
    return 901
  }

}