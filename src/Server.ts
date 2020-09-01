import dgram, { Socket } from 'dgram'

import Logger from '@bwatton/logger'
import { ServerOpts } from './types'
import { Stardust } from './Stardust'
import { API } from './API'

const DEFAULT_OPTS: ServerOpts = {
  address: '0.0.0.0',
  port: 19132,
  maxPlayers: 20,
  motd: {
    line1: 'A Stardust Server',
    line2: '',
  },
}

// TODO: Merge with Stardust.ts
export class Server {

  public static current: Server

  private logger: Logger = new Logger('Server')

  private sockets: Array<[string, Socket]> // Array<[id, Socket]>

  private startedAt: number = Date.now()

  private constructor(public opts: ServerOpts) {
    if(Server.current) {
      this.logger.error('Only one instance of Stardust can run per Node process')
      process.exit(1)
    } else {
      Server.current = this
    }

    this.sockets = [
      ['IPv4', dgram.createSocket({ type: 'udp4', reuseAddr: true })],
      // ['IPv6', dgram.createSocket({ type: 'udp6', reuseAddr: true })],
    ]

    this.init()
  }

  public get runningTime(): bigint {
    return BigInt(Date.now() - this.startedAt)
  }

  public static async start(opts?: Partial<ServerOpts>): Promise<Server> {
    await API.create()

    return new Server(Object.assign({}, DEFAULT_OPTS, opts))
  }

  private init() {
    const {
      address,
      port,
    } = this.opts

    this.sockets.forEach(async([id, socket]) => {
      socket.bind(port, address)
      await Stardust.create(socket)
      const logger = new Logger(`${this.logger.moduleName}(${id})`)

      socket.on('error', err => {
        logger.error(err)
        socket.close()
      })

      socket.on('listening', () => {
        const address = socket.address()
        logger.info(`Listening on ${address.address}:${address.port}`)
      })
    })
  }

}
