import { IAddress, IClientArgs, Packets, Protocol, DummyAddress, IBundledPacket } from '../types'
import Logger from '@bwatton/logger'
import { PacketData, BitFlag } from './PacketData'
import { PacketBundle } from './raknet/PacketBundle'
import { ConnectionRequest, ACK } from './raknet'
import { BundledPacket } from './raknet/BundledPacket'
import { Socket } from 'dgram'
import { Server } from '../Server'
import { ConnectionRequestAccepted } from './raknet/ConnectionRequestAccepted'
import { NewIncomingConnection } from './raknet/NewIncomingConnection'
import { PacketBatch } from './bedrock/PacketBatch'
import { Disconnect } from './bedrock'
import { ConnectedPing } from './raknet/ConnectedPing'
import { ConnectedPong } from './raknet/ConnectedPong'
import { PartialPacket } from './custom'

interface SplitQueue {
  [splitId: number]: BundledPacket<any>,
}

export class Client {

  private logger: Logger = new Logger('Client')

  public id: bigint
  public mtuSize: number

  public address: IAddress
  public socket: Socket

  // private splitQueue: Map<number, BundledPacket<any>> = new Map()
  private splitQueue: SplitQueue = {}

  constructor({ id, address, socket, mtuSize }: IClientArgs) {
    this.id = id
    this.address = address
    this.socket = socket
    this.mtuSize = mtuSize

    this.logger.info('Created for', `${address.ip}:${address.port}`)
  }

  public disconnect(message: string, hideScreen = false): void {
    this.send(new Disconnect({
      hideScreen,
      message,
    }))

    this.destroy()
  }

  private destroy() {
    Server.current.removeClient(this.address)
  }

  public handlePacket(data: PacketData): void {
    const flags = data.readByte(false)

    if(flags & BitFlag.ACK) {
      console.log('GOT ACK')
    } else if(flags & BitFlag.NAK) {
      console.log('GOT NAK')
    } else {
      const { packets, sequenceNumber } = new PacketBundle().decode(data)

      this.sendACK(sequenceNumber)

      for(const packet of packets) {
        this.handleBundledPacket(packet)
      }
    }
  }

  private handleBundledPacket(packet: BundledPacket<any>) {
    const props = packet.props as IBundledPacket
    if(props.hasSplit && !packet.hasBeenProcessed) {
      if(props.splitIndex === 0) {
        this.logger.debug(`Initial split packet for ${packet.data.buf[0]}`, packet)
        packet.data.pos = packet.data.length
        this.splitQueue[props.splitId] = packet
        // this.splitQueue.set(props.splitId, packet)
      } else {
        const queue = this.splitQueue[props.splitId]
        this.logger.debug(`Split packet ${props.splitIndex + 1}/${props.splitCount}`)
        // const bundled = this.splitQueue.get(props.splitId)

        if(!queue) {
          throw new Error(`Invalid Split ID: ${props.splitId} for packet: ${packet.id}`)
        } else {
          queue.append(packet.data)

          if(props.splitIndex === props.splitCount - 1) {
            queue.data.pos = 0
            queue.decode()
            queue.hasBeenProcessed = true
            this.handleBundledPacket(queue)
            delete this.splitQueue[props.splitId]
          }
        }
      }
    } else {
      switch(packet.id) {
        case Packets.CONNECTION_REQUEST:
          this.handleConnectionRequest(packet as ConnectionRequest)
          break
        case Packets.NEW_INCOMING_CONNECTION:
          this.handleNewIncomingConnection(packet as NewIncomingConnection)
          break
        case Packets.PACKET_BATCH:
          this.handlePacketBatch(packet as PacketBatch)
          break
        case Packets.DISCONNECTION_NOTIFICATION:
          this.logger.info('Client disconnected, destroying...')
          this.destroy()
          break
        case Packets.CONNECTED_PING:
          this.handleConnectedPing(packet as ConnectedPing)
          break
        default:
          this.logger.debug(`Unknown packet: ${packet.id}`)
      }
    }
  }

  private sendACK(sequenceNumber: number) {
    Server.current.send({
      packet: new ACK([sequenceNumber]),
      socket: this.socket,
      address: this.address,
    })
  }

  private send(packet: BundledPacket<any>, sequenceNumber = 0) {
    Server.current.send({
      packet: new PacketBundle({
        sequenceNumber,
        packets: [packet],
      }),
      socket: this.socket,
      address: this.address,
    })
  }

  private handleConnectedPing(packet: ConnectedPing) {
    const { time } = packet.props

    this.send(new ConnectedPong({
      pingTime: time,
      pongTime: time + 1n,
    }))
  }

  private handleConnectionRequest(packet: ConnectionRequest) {
    this.send(new ConnectionRequestAccepted({
      address: this.address,
      systemIndex: 0,
      systemAddresses: new Array<IAddress>(Protocol.SYSTEM_ADDRESSES).fill(DummyAddress),
      requestTime: packet.props.sendPingTime,
      time: Server.current.runningTime,
    }))
  }

  private handlePacketBatch(packet: PacketBatch) {
    if(packet instanceof PartialPacket) {
      console.log(`${packet.props.splitId + 1}/${packet.props.splitCount}`, packet)
    } else {
      console.log('PACKET BATCH', packet)
      const { packets } = packet.props

      for(const pk of packets) {
        console.log(pk)
      }
    }
  }

  private handleNewIncomingConnection(packet: NewIncomingConnection) {
    console.log('nic', packet.props)
  }

}
