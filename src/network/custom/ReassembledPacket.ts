import { BundledPacket } from '../raknet/BundledPacket'
import { PartialPacket } from './PartialPacket'

export class ReassembledPacket extends BundledPacket {

  constructor(public parts: Array<PartialPacket>, flags?: number) {
    super(flags, [])
  }

}
