import { ContainerType } from '../types'
import { Container } from './Container'

export class Armor extends Container {

  constructor() {
    super(ContainerType.ARMOR, [], 'Armor', 4)
  }

}
