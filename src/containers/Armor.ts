import { Container } from './Container'

export class Armor extends Container {

  constructor(id: number = ContainerId.ARMOR) {
    super(id, ContainerType.ARMOR, [], 'Armor', 4)
  }

}

import { ContainerId, ContainerType } from '../types/containers'
