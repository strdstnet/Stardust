import { IAddress, FamilyStrToInt, AddressFamilyStr, Packets } from './types'
import { RemoteInfo, Socket } from 'dgram'
import { AddressInfo } from 'net'
import { Agent } from './services/Agent'
import { API, ServerType } from './API'

export class Stardust {

  public static instance: Stardust

  // private clients: Map<string, ProxyClient> = new Map()
  private agents: Map<string, Agent> = new Map()

  private constructor(private downstream: Socket) {
    Stardust.instance = this

    this.downstream.on('message', async (msg, rinfo) => {
      const addrId = this.getAddrId(rinfo)

      if(
        !this.agents.has(addrId) &&
        (msg[0] === Packets.UNCONNECTED_PING || msg[0] === Packets.OPEN_CONNECTION_REQUEST_ONE)
      ) {
        if(rinfo.address === '192.168.0.1') return

        const dAddr = this.getAddr(rinfo)

        const uAddr = await API.instance.getServer(ServerType.LOBBY)
        this.agents.set(addrId, await Agent.create(uAddr, dAddr, this.downstream))
      }
    })
  }

  public static async create(downstream: Socket): Promise<Stardust> {
    const stardust = new Stardust(downstream)

    return stardust
  }

  public get agentCount(): number {
    return this.agents.size
  }

  public getAddr({ address, family, port }: AddressInfo | RemoteInfo): IAddress {
    return {
      ip: address,
      port,
      family: FamilyStrToInt[(family as AddressFamilyStr)],
    }
  }

  public getAddrId(addr: IAddress | RemoteInfo): string {
    const ip = (addr as any).ip || (addr as any).address
    const family = typeof addr.family === 'number' ? addr.family : FamilyStrToInt[addr.family]
    return `${family};${ip};${addr.port}`
  }

}
