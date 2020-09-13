import { ContainerType } from '../types'
import { Container } from './Container'

export class EnderChest extends Container {

  constructor() {
    super(ContainerType.ARMOR, [], 'EnderChest', 27)
  }

}
