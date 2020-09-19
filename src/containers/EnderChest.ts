import { ContainerType } from '../types/containers'
import { Container } from './Container'

export class EnderChest extends Container {

  constructor() {
    super(ContainerType.ARMOR, [], 'EnderChest', 27)
  }

}
