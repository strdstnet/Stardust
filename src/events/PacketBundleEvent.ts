import { BundledPacket } from '../network/raknet/BundledPacket'
import { PacketBundle } from '../network/raknet/PacketBundle'
import { PacketEvent } from './PacketEvent'

type EventArgs = [number, Array<BundledPacket<any>>] // [sequenceNumber, packets]

export class PacketBundleEvent extends PacketEvent<PacketBundle, EventArgs> {

  private indexedPackets: Record<number, BundledPacket<any>> = {}

  constructor(packetId: number, packet: PacketBundle, sequenceNumber: number, packets: Array<BundledPacket<any>>) {
    super(packetId, packet, [sequenceNumber, packets])

    for(const [idx, packet] of packets.entries()) {
      this.indexedPackets[idx] = packet
    }
  }

  public get sequenceNumber(): number {
    return this.args[2][0]
  }

  public get packets(): Array<BundledPacket<any>> {
    return Object.values(this.indexedPackets)
  }

  public removePacket(index: number): void {
    delete this.indexedPackets[index]
  }

}
