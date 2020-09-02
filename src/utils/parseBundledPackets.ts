import { PacketData } from '../network'
import { IBundledPacket, Packets, Protocol, Props } from '../types'
import {
  ConnectedPing,
  ConnectionRequest,
  NewIncomingConnection,
  ConnectionRequestAccepted,
  PacketBundle,
  ConnectedPong,
} from '../network/raknet'
import {
  PacketBatch,
  DisconnectionNotification,
} from '../network/bedrock'
import {
  PartialPacket, UnknownBundledPacket, ReassembledPacket,
} from '../network/custom'
import { BPacket, BundledPacket } from '../network/raknet/BundledPacket'

export function decodeBundledPacket<T extends IBundledPacket = BPacket<any>>(data: PacketData): [T, number] {
  const flags = data.readByte()
  const length = Math.ceil(data.readShort() / 8)
  const props = {
    id: 0,
    reliability: (flags & 0xe0) >> 5,
    hasSplit: (flags & 0x10) > 0,
    messageIndex: 0,
    sequenceIndex: 0,
    orderIndex: 0,
    orderChannel: 0,
    splitCount: 0,
    splitId: 0,
    splitIndex: 0,
  }

  if(BundledPacket.isReliable(props.reliability)) props.messageIndex = data.readLTriad()

  if(BundledPacket.isSequenced(props.reliability)) props.sequenceIndex = data.readLTriad()

  if(BundledPacket.isSequencedOrOrdered(props.reliability)) {
    props.orderIndex = data.readLTriad()
    props.orderChannel = data.readByte()
  }

  if(props.hasSplit) {
    props.splitCount = data.readInt()
    props.splitId = data.readShort()
    props.splitIndex = data.readInt()
  }

  return [(props as unknown as T), length]
}

export function encodeBundledPacket(packet: BundledPacket<Props>): PacketData {
  const data = new PacketData()

  const packetData = packet.data || packet.encode(packet.props)

  packet.encodeBundleHeader(packetData, data)

  return data
}

/**
 * @return [PacketBundle[], sequenceNumber, splitId]
 */
export function bundlePackets(packets: Array<BundledPacket<any>>, _sequenceNumber = 0, _lastSplitId = -1, mtuSize: number = Protocol.DEFAULT_MTU): [PacketBundle[], number, number] {
  let sequenceNumber = _sequenceNumber + 0
  let lastSplitId = _lastSplitId + 0

  // IP header size (20 bytes) + UDP header size (8 bytes) + RakNet weird (8 bytes) + datagram header size (4 bytes) + max encapsulated packet header size (20 bytes)
  const maxLength = mtuSize - 60

  const bundles: PacketBundle[] = []
  for(const packet of packets) {
    const packetData = packet.encode()

    if(packetData.length > maxLength) {
      const dataParts = packetData.split(maxLength)
      const splitId = ++lastSplitId % 65536

      for(const [idx, dataPart] of dataParts.entries()) {
        const partial = new PartialPacket(packet.id)
        partial.props = Object.assign({}, packet.props)
        partial.props.hasSplit = true
        partial.props.splitId = splitId
        partial.props.splitCount = dataParts.length
        partial.props.splitIndex = idx

        partial.encodeBundleHeader(dataPart)

        bundles.push(new PacketBundle({
          sequenceNumber: sequenceNumber++,
          packets: [partial],
        }))
      }
    } else {
      const sqN = sequenceNumber++
      packet.encodeBundleHeader(packetData)
      bundles.push(new PacketBundle({
        sequenceNumber: sqN,
        packets: [packet],
      }))
    }
  }
  return [bundles, sequenceNumber, lastSplitId]
}

export function parseBundledPackets(data: PacketData): Array<BundledPacket<any>> {
  const packets: Array<BundledPacket<any>> = []

  while(!data.feof) {
    const [props, length] = decodeBundledPacket(data)

    const posBefore = data.pos

    const packetId = data.buf[data.pos]

    let packet: BundledPacket<any> | null = null
    // if(props.hasSplit) {
    if(props.hasSplit && props.splitIndex > 0) {
      // if(props.splitIndex < props.splitCount - 1) {
      packet = new PartialPacket(packetId)
      // } else {
      //   packet = new ReassembledPacket()
      // }
    } else {
      switch(packetId) {
        case Packets.CONNECTION_REQUEST:
          packet = new ConnectionRequest()
          break
        case Packets.CONNECTION_REQUEST_ACCEPTED:
          packet = new ConnectionRequestAccepted()
          break
        case Packets.NEW_INCOMING_CONNECTION:
          packet = new NewIncomingConnection()
          break
        case Packets.CONNECTED_PING:
          packet = new ConnectedPing()
          break
        case Packets.CONNECTED_PONG:
          packet = new ConnectedPong()
          break
        case Packets.PACKET_BATCH:
          packet = new PacketBatch()
          break
        case Packets.DISCONNECTION_NOTIFICATION:
          packet = new DisconnectionNotification()
          break
        default:
          packet = new UnknownBundledPacket(packetId)
          // console.log(`UNKNOWN BUNDLED: ${packetId}`)
          // throw new Error(`Unknown packet: (dec) ${data.buf[data.pos]}`)
      }
    }

    packet.props = props

    if(props.hasSplit) {
      packet.data = data.readByteArray(length)
    } else {
      packet.decode(new PacketData(data.read(length)), props)
    }

    packets.push(packet)

    data.pos = posBefore + length
  }

  return packets
}
