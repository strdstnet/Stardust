import { Upstream } from './Upstream'
import { Downstream } from './Downstream'
import dgram, { Socket } from 'dgram'
import { IAddress } from '../types'
import { UnconnectedPong, IUnconnectedPing } from '../network/raknet'
import { Stardust } from '../Stardust'
import { Server } from '../Server'
import Logger from '@bwatton/logger'
import { PacketEvent, PacketBundleEvent, BundledPacketEvent, BatchedPacketEvent, PacketBatchEvent } from '../events'
import { Packet } from '../network/Packet'
import { PacketBatch, PacketViolationWarning, Transfer } from '../network/bedrock'
import { BatchedPacket } from '../network/bedrock/BatchedPacket'

type PEvent<P> = PacketEvent<Packet<P>, any[]>
type BPEvent<P extends BatchedPacket<any>> = BatchedPacketEvent<P>

export class Agent {

  private static logger = new Logger('Agent')

  private get logger() {
    return Agent.logger
  }

  private constructor(private upstream: Upstream, private downstream: Downstream) {
    this.initUpstreamHandlers()
    this.initDownstreamHandlers()
  }

  private initUpstreamHandlers() {
    this.upstream.on('Transfer', async event => {
      const e = event as BPEvent<Transfer>

      console.log('GOT TRANSFER', e.packet.props)
      process.exit()
    })

    this.upstream.on('PacketBundle', async event => {
      const e = event as PacketBundleEvent

      // console.log('\n----UPSTREAM:----')
      // e.packets.forEach(console.log)
      // console.log('-----------------\n')

      this.downstream.sendBundled(e.packets, e.sequenceNumber)
    })

    this.upstream.on('*', async e => {
      if(
        e instanceof PacketBundleEvent ||
        e instanceof BundledPacketEvent ||
        e instanceof PacketBatchEvent ||
        e instanceof BatchedPacketEvent
      ) return

      if(e.shouldProxy) {
        this.downstream.send(e.packet.data)
      }
    })
  }

  private initDownstreamHandlers() {
    this.downstream.on('UnconnectedPing', async (e: PEvent<IUnconnectedPing>) => {
      const { pingId } = e.packet.props

      const { maxPlayers, motd: { line1, line2 } } = Server.current.opts
      this.downstream.sendPacket(new UnconnectedPong({
        pingId,
        motd: UnconnectedPong.getMOTD({
          line1,
          line2,
          maxPlayers,
          numPlayers: Stardust.instance.agentCount,
        }),
      }))

      e.setProxy(false)
    })

    this.downstream.on('PacketBundle', async event => {
      const e = event as PacketBundleEvent

      // console.log('\n---DOWNSTREAM:---')
      // e.packets.forEach(p => console.log(p))
      // console.log('-----------------\n')

      this.upstream.sendBundled(e.packets, e.sequenceNumber)
    })

    // this.downstream.on('PacketBatch', async event => {
    //   const e = event as PacketBatchEvent

    // this.upstream.sendBatched(e.packets,)
    // })

    this.downstream.on('*', async (e) => {
      if(
        e instanceof PacketBundleEvent ||
        e instanceof BundledPacketEvent ||
        e instanceof PacketBatchEvent ||
        e instanceof BatchedPacketEvent
      ) return

      if(e.shouldProxy) {
        if(e.packet instanceof PacketBatch) {
          if(e.packet.props.packets[0] instanceof PacketViolationWarning) {
            console.log(e.packet.props.packets[0])
            throw new Error('PacketViolationWarning')
          }
        }
        this.upstream.send(e.packet.data)
      }
    })
  }

  public static async create(uAddr: IAddress, dAddr: IAddress, socket: Socket): Promise<Agent> {
    const uSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    this.logger.info(`Created for ${dAddr.ip}:${dAddr.port}`)
    return new Agent(
      new Upstream(uAddr, uSocket),
      new Downstream(dAddr, socket)
    )
  }

}
