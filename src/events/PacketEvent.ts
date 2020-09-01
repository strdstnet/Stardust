import { Event } from './Event'
import { Packet } from '../network/Packet'

type EventArgs<P> = [number, P]

export class PacketEvent<P extends Packet<any> = Packet<any>, A extends any[] = []> extends Event<[number, P, A]> {

  private proxy = true

  constructor(packetId: number, packet: P, extra: any[] = []) {
    super(packetId, packet, extra as any)
  }

  public get packetId(): number {
    return this.args[0]
  }

  public get packet(): P {
    return this.args[1]
  }

  public get shouldProxy(): boolean {
    return this.proxy
  }

  public setProxy(proxy: boolean): void {
    this.proxy = proxy
  }

}
