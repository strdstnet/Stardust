import { Packet } from '../Packet'

export class BatchedPacket<T = never> extends Packet<T> {

  protected decodeId = false
  protected encodeId = false

}
