import { PacketEvent } from './PacketEvent'
import { BatchedPacket } from '../network/bedrock/BatchedPacket'
import { PacketBatch } from '../network/bedrock/PacketBatch'

export class PacketBatchEvent extends PacketEvent<PacketBatch, [Array<BatchedPacket<any>>]> {

  private indexedPackets: Record<number, BatchedPacket<any>> = {}

  constructor(packetId: number, packet: PacketBatch, packets: Array<BatchedPacket<any>>) {
    super(packetId, packet, [packets])

    for(const [idx, packet] of packets.entries()) {
      this.indexedPackets[idx] = packet
    }
  }

  public get packets(): Array<BatchedPacket<any>> {
    return Object.values(this.indexedPackets)
  }

  public removePacket(index: number): void {
    delete this.indexedPackets[index]
  }

}
