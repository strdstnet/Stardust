import { IPlayer } from './player'

export interface ServerOpts {
  address: string,
  port: number,
  maxPlayers: number,
  level: string,
  motd: {
    line1: string,
    line2: string,
  },
  plugins: string[],
}

export interface IServer {
  players: Map<bigint, IPlayer>,
}
