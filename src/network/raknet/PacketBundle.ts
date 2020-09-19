import { Packet, ParserType, PacketProps } from '../Packet'
import { DataType } from '../../types/data'
import { BinaryData, BitFlag } from '../../utils/BinaryData'
import { parseBundledPackets, encodeBundledPacket } from '../../utils/parseBundledPackets'
import { BundledPacket } from './BundledPacket'

export interface IPacketBundle {
  sequenceNumber: number,
  packets: Array<BundledPacket<any>>,
}

type PacketBundleDecode = PacketProps<IPacketBundle> & {
  flags: number,
}

export class PacketBundle extends Packet<IPacketBundle> {

  constructor(p?: IPacketBundle, flags: number = BitFlag.Valid) {
    // if(p) {
    //   console.log('sending:', p.sequenceNumber)
    // }

    super(flags, [
      { name: 'sequenceNumber', parser: DataType.L_TRIAD },
      {
        parser({ type, props, data }) {
          if(type === ParserType.DECODE) {
            props.packets = parseBundledPackets(data)
          } else {
            for(const packet of props.packets) {
              data.append(encodeBundledPacket(packet).buf)
            }
          }
        },
      },
    ])

    if(p) this.props = p
  }

  public decode(data: BinaryData): PacketBundleDecode {
    super.decode(data)

    return {
      ...(this.props),
      id: this.id,
      flags: this.id,
    }
  }

}
