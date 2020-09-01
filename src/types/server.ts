export interface ServerOpts {
  address: string,
  port: number,
  maxPlayers: number,
  motd: {
    line1: string,
    line2: string,
  },
}
