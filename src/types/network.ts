import { Socket } from 'dgram'
import { PacketData } from '../network/PacketData'
import { Packet } from '../network/Packet'

export interface IAddress {
  ip: string,
  port: number,
  family: AddressFamily,
}

export enum AddressFamily {
  IPV4 = 4,
  IPV6 = 6,
}

export enum AddressFamilyStr {
  IPV4 = 'IPv4',
  IPV6 = 'IPv6',
}

export const FamilyIntToStr = {
  [AddressFamily.IPV4]: AddressFamilyStr.IPV4,
  [AddressFamily.IPV6]: AddressFamilyStr.IPV6,
}

export const FamilyStrToInt = {
  [AddressFamilyStr.IPV4]: AddressFamily.IPV4,
  [AddressFamilyStr.IPV6]: AddressFamily.IPV6,
}

export interface ISendPacketArgs {
  packet: Packet<any>,
  socket: Socket,
  address: IAddress,
}

export interface IPacketHandlerArgs {
  data: PacketData,
  socket: Socket,
  address: IAddress,
}

export interface IClientArgs {
  id: bigint,
  address: IAddress,
  socket: Socket,
  mtuSize: number,
}

export interface IBundledPacket {
  reliability: number,
  hasSplit: boolean,
  messageIndex: number,
  sequenceIndex: number,
  orderIndex: number,
  orderChannel: number,
  splitCount: number,
  splitId: number,
  splitIndex: number,
}
