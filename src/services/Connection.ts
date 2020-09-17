import { Socket } from 'dgram'
import { IAddress, Packets } from '../types'
import { Stardust } from '../Stardust'
import { BinaryData, BitFlag } from '../network'
import Logger from '@bwatton/logger'
import { BedrockPackets, RaknetPackets } from '../network/packets'
import { ACK, NAK, PacketBundle } from '../network/raknet'
import { BundledPacket } from '../network/raknet/BundledPacket'
import { Packet } from '../network/Packet'
import { PacketEvent, EventEmitter, PacketBundleEvent, BundledPacketEvent, PacketBatchEvent, BatchedPacketEvent } from '../events'
import { PacketBatch } from '../network/bedrock'

export enum ProxyState {
  INITIAL, // Pre-transfer, proxying
  TRANSFER, // Transfer, not proxying
  PROXYING, // Post-transfer, proxying
}

export abstract class Connection extends EventEmitter<PacketEvent<any, any[]>> {

  public proxyState: ProxyState = ProxyState.INITIAL

  protected abstract logger: Logger

  public addrId: string

  public sequenceNumber = -1

  constructor(public addr: IAddress, protected socket: Socket) {
    super()

    this.addrId = Stardust.instance.getAddrId(addr)

    this.socket.on('message', async (msg, rinfo) => {
      const addrId = Stardust.instance.getAddrId(rinfo)

      // this.logger.debug('received', msg)

      if(addrId !== this.addrId) {
        // this.logger.error(`Message from unknown origin (${addrId}). Ignoring.`)
        return
      }

      // if(![Packets.UNCONNECTED_PING, Packets.UNCONNECTED_PONG].includes(msg[0])) this.logger.debug('Received', msg)

      const data = new BinaryData(msg)

      const flags = data.readByte(false)

      if(!(flags & BitFlag.Valid)) {
        const packetDef = RaknetPackets[flags]

        if(packetDef) {
          const [name, packetClass] = packetDef
          this.emit(name, new PacketEvent(flags, new packetClass().parse(data)))
        }
      } else {
        if(flags & BitFlag.ACK) {
          this.emit('ACK', new PacketEvent(Packets.ACK, new ACK().parse(data)))

          // TODO: Correct sequence numbers
        } else if(flags & BitFlag.NAK) {
          this.emit('NAK', new PacketEvent(Packets.NAK, new NAK().parse(data)))

          // TODO: Correct sequence numbers
        } else {
          const bundle = new PacketBundle()
          const { packets, sequenceNumber } = bundle.decode(data)

          const bundleEvent = new PacketBundleEvent(flags, bundle, sequenceNumber, packets)

          // if(this.proxyState === ProxyState.INITIAL) {
          // this.sequenceNumber = sequenceNumber
          // } else {
          // this.sequenceNumber++
          this.sequenceNumber = sequenceNumber

          // if(this.sequenceNumber !== sequenceNumber) {
          //   this.logger.error('out-of-sync SQN', this.sequenceNumber, sequenceNumber)
          // }

          this.logger.debug(this.sequenceNumber)

          // }

          // if(this.proxyState === ProxyState.TRANSFER) {
          //   this.sendACK([sequenceNumber])
          // }

          for(const [idx, packet] of packets.entries()) {
            if(packet instanceof PacketBatch) {
              await this.handlePacketBatch(packet)
            } else {
              const packetDef = BedrockPackets[packet.id]

              await this.emit(
                packetDef ? packetDef[0] : 'UnknownBundledPacket',
                new BundledPacketEvent(packet.id, packet, [idx, bundleEvent])
              )
            }
          }

          this.emit('PacketBundle', bundleEvent)
        }
      }
    })
  }

  private async handlePacketBatch(packet: PacketBatch): Promise<void> {
    const { packets } = packet.props
    const event = new PacketBatchEvent(packet.id, packet, packets)

    for(const [idx, packet] of packets.entries()) {
      const packetDef = BedrockPackets[packet.id]

      await this.emit(
        packetDef ? packetDef[0] : 'UnknownBatchedPacket',
        new BatchedPacketEvent(packet.id, packet, [idx, event])
      )
    }

    await this.emit('PacketBatch', event)
  }

  public send(data: BinaryData, ip: string = this.addr.ip, port: number = this.addr.port): void {
    // if(![Packets.UNCONNECTED_PING, Packets.UNCONNECTED_PONG].includes(data.buf[0])) this.logger.debug('Sent    ', data.buf)

    // this.logger.debug('sending', data.buf)
    this.socket.send(data.toBuffer(), port, ip)
  }

  public sendPacket(packet: Packet<any>): void {
    this.send(packet.encode())
  }

  public sendACK(sequences: number[]): void {
    this.send(new ACK(sequences).encode())
  }

  public sendBundled(packets: BundledPacket[], sequenceNumber: number): void {
    // this.logger.debug(`Sending ${packets.length} packets with sq ${sequenceNumber}`)
    this.sendPacket(new PacketBundle({
      packets, sequenceNumber,
    }))
  }

  // public sendBatched(packets: BatchedPacket[]): void {
  //   this.sendBundled()
  // }

}
