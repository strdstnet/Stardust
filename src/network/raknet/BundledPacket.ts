import { Packet, PacketProps, IPacketSchemaItem } from '../Packet'
import { Reliability } from '../../utils/Reliability'
import { IBundledPacket } from '../../types/network'
import { BinaryData } from '../../utils/BinaryData'

export type BPacket<T> = T & IBundledPacket
export type BPacketOpt<T> = T & Partial<IBundledPacket>
export class BundledPacket<T = unknown> extends Packet<BPacket<T>> {

  public hasBeenProcessed = false
  public headerEncoded = false

  public static defaultProps: IBundledPacket = {
    reliability: Reliability.Unreliable,
    hasSplit: false,
    messageIndex: 0,
    sequenceIndex: 0,
    orderIndex: 0,
    orderChannel: 0,
    splitCount: 0,
    splitId: 0,
    splitIndex: 0,
  }

  constructor(flags?: number, schema: Array<IPacketSchemaItem<BPacket<T>>> = []) {
    super((flags || 0) & 0xff, schema)
  }

  public decode(data: BinaryData = this.data, bundledProps?: PacketProps<IBundledPacket>): PacketProps<BPacket<T>> {
    return {
      ...(bundledProps || {}),
      ...super.decode(data),
    }
  }

  public append(data: BinaryData): void {
    this.data.append(data.buf, data.pos)
  }

  public clone(): BundledPacket<T> {
    const copy = new (this.constructor as new () => BundledPacket<T>)()
    Object.assign(copy, this)
    return copy
  }

  public encodeBundleHeader(packetData: BinaryData, bundle: BinaryData = new BinaryData()): BinaryData {
    if(this.headerEncoded) return this.data

    let flags = this.props.reliability << 5
    if(this.props.hasSplit) flags = flags | 0x10

    bundle.writeByte(flags)
    bundle.writeShort(packetData.length << 3)

    if(BundledPacket.isReliable(this.props.reliability)) {
      bundle.writeLTriad(this.props.messageIndex)
    }

    if(BundledPacket.isSequenced(this.props.reliability)) {
      bundle.writeLTriad(this.props.sequenceIndex)
    }

    if(BundledPacket.isSequencedOrOrdered(this.props.reliability)) {
      bundle.writeLTriad(this.props.orderIndex)
      bundle.writeByte(this.props.orderChannel)
    }

    if(this.props.hasSplit) {
      bundle.writeInt(this.props.splitCount)
      bundle.writeShort(this.props.splitId)
      bundle.writeInt(this.props.splitIndex)
    }

    bundle.append(packetData)

    this.data = bundle

    this.headerEncoded = true

    return bundle
  }

  public getHeaderLength(): number {
    return [
      3, // reliability + length
      (BundledPacket.isReliable(this.props.reliability) ? 3 : 0), // message index
      (BundledPacket.isSequenced(this.props.reliability) ? 3 : 0), // sequence index
      (BundledPacket.isSequencedOrOrdered(this.props.reliability) ? 4 : 0), // order index + order channel
      (this.props.hasSplit ? 10 : 0), // split count, split id, split index
    ].reduce((p, c) => p + c)
  }

  public static isReliable(reliability: number): boolean {
    return (
      reliability === Reliability.Reliable ||
      reliability === Reliability.ReliableOrdered ||
      reliability === Reliability.ReliableSequenced ||
      reliability === Reliability.ReliableACK ||
      reliability === Reliability.ReliableOrderedACK
    )
  }

  public static isSequenced(reliability: number): boolean {
    return (
      reliability === Reliability.UnreliableSequenced ||
      reliability === Reliability.ReliableSequenced
    )
  }

  public static isOrdered(reliability: number): boolean {
    return (
      reliability === Reliability.ReliableOrdered ||
      reliability === Reliability.ReliableOrderedACK
    )
  }

  public static isSequencedOrOrdered(reliability: number): boolean {
    return BundledPacket.isSequenced(reliability) || BundledPacket.isOrdered(reliability)
  }

}
