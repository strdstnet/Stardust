import { Connection } from './Connection'
import Logger from '@bwatton/logger'
import { IAddress } from '../types'
import { Socket } from 'dgram'

/**
 * @description Represents the Downstream (Game)
 */
export class Downstream extends Connection {

  protected logger = new Logger('Downstream')

  constructor(addr: IAddress, protected socket: Socket) {
    super(addr, socket)
  }

}
