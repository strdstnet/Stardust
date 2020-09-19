import { BundledPacket } from '../network/raknet/BundledPacket'
import { PacketEvent } from './PacketEvent'
import { PacketBundleEvent } from './PacketBundleEvent'

type EventArgs = [number, PacketBundleEvent] // [bundleIndex, bundleEvent]

export class BundledPacketEvent extends PacketEvent<BundledPacket<any>, EventArgs> {

  public get bundleIndex(): number {
    return this.args[2][0]
  }

  public get bundleEvent(): PacketBundleEvent {
    return this.args[2][1]
  }

  public remove(): void {
    this.bundleEvent.removePacket(this.bundleIndex)
  }

}
