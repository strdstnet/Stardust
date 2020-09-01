import { Connection } from './Connection'
import Logger from '@bwatton/logger'
import { IAddress } from '../types'
import { Socket } from 'dgram'

/**
 * @description Represents the Upstream (Server)
 */
export class Upstream extends Connection {

  protected logger = new Logger('Upstream')

  constructor(addr: IAddress, protected socket: Socket) {
    super(addr, socket)
  }

}
