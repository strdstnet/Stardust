import { AddressFamily, IAddress } from '@strdstnet/utils.binary'
import { Socket } from 'dgram'

export const FamilyStrToInt = {
  'IPv4': AddressFamily.IPV4,
  'IPv6': AddressFamily.IPV6,
}

export interface ISendPacketArgs {
  packet: any,
  socket: Socket,
  address: IAddress,
}

export interface IPacketHandlerArgs {
  data: any,
  socket: Socket,
  address: IAddress,
}

export interface IClientArgs {
  id: bigint,
  address: IAddress,
  socket: Socket,
  mtuSize: number,
}

export const DummyAddress: IAddress = {
  ip: '0.0.0.0',
  port: 19132,
  family: 4,
}
