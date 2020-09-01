import * as bedrock from './bedrock'
import * as raknet from './raknet'
import { Packet } from './Packet'
import { Packets } from '../types'

interface PacketConstructor {
  new(): Packet<any>;
}

export const BedrockPackets: {
  [k: number]: [string, PacketConstructor]
} = {}

export const RaknetPackets: {
  [k: number]: [string, PacketConstructor]
} = {}

for(const [name, packet] of Object.entries(bedrock)) {
  const pkId = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
  const id = Packets[pkId as any] as any

  BedrockPackets[id] = [name, packet]
}

for(const [name, packet] of Object.entries(raknet)) {
  if(name !== 'PacketBundle') {
    const pkId = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
    const id = Packets[pkId as any] as any

    RaknetPackets[id] = [name, packet]
  }
}
