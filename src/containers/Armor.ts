import { Container } from './Container'

export class Armor extends Container {

  constructor() {
    super(ContainerType.ARMOR, [], 'Armor', 4)
  }

}

import { ContainerType } from '../types/containers'
