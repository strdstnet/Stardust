import { Container } from './Container'

export class EnderChest extends Container {

  constructor(id: number) {
    super(id, ContainerType.ARMOR, [], 'EnderChest', 27)
  }

}

import { ContainerId, ContainerType } from '../types/containers'
