import { BundledPacket, BPacketOpt } from '../raknet/BundledPacket'
import { Packets } from '../../types'
import { BatchedPacket } from './BatchedPacket'
import { ParserType } from '../Packet'
import { Login } from './Login'
import { BinaryData } from '../../utils/BinaryData'
import { Transfer } from './Transfer'
import { ChangeDimension } from './ChangeDimension'
import { PacketViolationWarning } from './PacketViolationWarning'
import { SetTitle } from './SetTitle'
import { PlayStatus } from './PlayStatus'
import { ResourcePacksInfo } from './ResourcePacksInfo'
import { StartGame } from './StartGame'
import { ChunkRadiusUpdated } from './ChunkRadiusUpdated'
import { UnknownBatchedPacket } from '../custom'
import { ResourcePacksResponse } from './ResourcePacksResponse'
import { Text } from './Text'

interface IPacketBatch {
  packets: Array<BatchedPacket<any>>,
}

export class PacketBatch extends BundledPacket<IPacketBatch> {

  private static PID_MASK = 0x3ff
  private static SENDER_SUBCLIENT_ID_SHIFT = 0x0A
  private static RECIPIENT_SUBCLIENT_ID_SHIFT = 0x0C

  private static senderSubId = 0
  private static recipientSubId = 0

  constructor(p?: BPacketOpt<IPacketBatch>) {
    super(Packets.PACKET_BATCH, [
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            props.packets = []

            const buffer = BinaryData.inflate(data.readRemaining())//

            while(!buffer.feof) {
              // const posBefore = buffer.pos

              const length = buffer.readUnsignedVarInt()
              const buf = new BinaryData(buffer.read(length))

              const header = buf.readUnsignedVarInt()
              const packetId = header & PacketBatch.PID_MASK

              let packet: BatchedPacket<any> | null = null
              // TODO: Make automatic, somehow
              switch(packetId) {
                case Packets.LOGIN:
                  packet = new Login()
                  break
                case Packets.PLAY_STATUS:
                  packet = new PlayStatus()
                  break
                case Packets.TRANSFER:
                  packet = new Transfer()
                  break
                case Packets.CHANGE_DIMENSION:
                  packet = new ChangeDimension()
                  break
                case Packets.PACKET_VIOLATION_WARNING:
                  packet = new PacketViolationWarning()
                  break
                case Packets.SET_TITLE:
                  packet = new SetTitle()
                  break
                case Packets.RESOURCE_PACKS_INFO:
                  packet = new ResourcePacksInfo()
                  break
                case Packets.RESOURCE_PACKS_RESPONSE:
                  packet = new ResourcePacksResponse()
                  break
                case Packets.START_GAME:
                  packet = new StartGame()
                  break
                case Packets.CHUNK_RADIUS_UPDATED:
                  packet = new ChunkRadiusUpdated()
                  break
                case Packets.TEXT:
                  packet = new Text()
                  break
                // case Packets.RESOURCE_PACKS_STACK:
                //   packet = new BatchedPacket(packetId, [])
                //   break
                default:
                  packet = new UnknownBatchedPacket(packetId, [])
                  // console.log(packetId)
                  // console.log(buffer.buf)
                  // console.log(buf.buf)
                  // console.log(length)
                  // console.log(buffer.length)
                  // console.log(packet)
                  // if(true) (process as any).exit()
              }

              if(packet) {
                // buf.pos = 0
                packet.decode(buf)
                props.packets.push(packet)
              }

              // buffer.pos = posBefore + length
            }
          } else {
            const uncompressed = new BinaryData()

            if(!Array.isArray(props.packets)) {
              console.log(props)
              throw new Error('wot')
            }

            for(const packet of props.packets) {
              const packetData = new BinaryData()

              packetData.writeUnsignedVarInt(
                packet.id |
                (PacketBatch.senderSubId << PacketBatch.SENDER_SUBCLIENT_ID_SHIFT) |
                (PacketBatch.recipientSubId << PacketBatch.RECIPIENT_SUBCLIENT_ID_SHIFT),
              )
              packetData.append(packet.encode().toBuffer())

              uncompressed.writeUnsignedVarInt(packetData.length)
              uncompressed.append(packetData.toBuffer())
            }

            data.append(BinaryData.deflate(uncompressed.toBuffer()).toBuffer())
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, BundledPacket.defaultProps, p)
  }

}
