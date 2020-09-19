import { Packet } from '../Packet'
import { Packets, Protocol } from '../../types/protocol'
import { DataType } from '../../types/data'

export interface IUnconnectedPong {
  pingId: bigint,
  motd: string,
}

export interface IUnconnectedPongMOTD {
  line1: string,
  line2: string,
  maxPlayers: number,
  numPlayers: number,
}

export class UnconnectedPong extends Packet<IUnconnectedPong> {

  public static getMOTD({ line1, line2, maxPlayers, numPlayers }: IUnconnectedPongMOTD): string {
    return `MCPE;${line1};27;${Protocol.BEDROCK_VERSION};${numPlayers};${maxPlayers};0;${line2}`
  }

  public static parseMOTD(motd: string): IUnconnectedPongMOTD {
    const parts = motd.split(';')

    return {
      line1: parts[1],
      line2: parts[7],
      maxPlayers: parseInt(parts[5], 10),
      numPlayers: parseInt(parts[4], 10),
    }
  }

  constructor(p?: IUnconnectedPong) {
    super(Packets.UNCONNECTED_PONG, [
      { name: 'pingId', parser: DataType.LONG },
      { parser: DataType.LONG, resolve: () => Protocol.SERVER_ID },
      { name: 'magic', parser: DataType.MAGIC },
      { name: 'motd', parser: DataType.RAW_STRING },
    ])

    if(p) this.props = p
  }

}
