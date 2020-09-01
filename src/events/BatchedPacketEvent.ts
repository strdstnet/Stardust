import { PacketEvent } from './PacketEvent'
import { PacketBatchEvent } from './PacketBatchEvent'
import { BatchedPacket } from '../network/bedrock/BatchedPacket'

type EventArgs = [number, PacketBatchEvent] // [batchIndex, bundleEvent]

export class BatchedPacketEvent<P extends BatchedPacket<any> = BatchedPacket<any>> extends PacketEvent<P, EventArgs> {

  public get batchIndex(): number {
    return this.args[2][0]
  }

  public get batchEvent(): PacketBatchEvent {
    return this.args[2][1]
  }

  public remove(): void {
    this.batchEvent.removePacket(this.batchIndex)
  }

}
