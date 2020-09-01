import { BundledPacket } from '../raknet/BundledPacket'
import { Packets } from '../../types'

export class DisconnectionNotification extends BundledPacket {

  constructor() {
    super(Packets.DISCONNECTION_NOTIFICATION, [])
  }

}
