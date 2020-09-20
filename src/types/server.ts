import { IPlayer } from './player'

export interface ServerOpts {
  address: string,
  port: number,
  maxPlayers: number,
  motd: {
    line1: string,
    line2: string,
  },
}

export interface IServer {
  players: Map<bigint, IPlayer>,
}
