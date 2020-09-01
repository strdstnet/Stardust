import chalk from 'chalk'
import { Packet } from '../network/Packet'
import { Direction } from '../network/ProxyClient'
import { PacketBatch } from '../network/bedrock'
import { BundledPacket, PacketBundle, ACK } from '../network/raknet'
import { Acknowledgement } from '../network/raknet/Acknowledgement'

export class ProxyLogger {

  private Client = chalk.keyword('orange')('Client')
  private Stardust = chalk.magentaBright('Stardust')
  private Server = chalk.cyanBright('Server')

  public log(packet: Packet<any>, dir: Direction): void {
    let packetName = 'Packet'
    let packetArgs: Array<string | number> | undefined
    if(packet instanceof PacketBatch) {
      packetName = 'PacketBatch'
      packetArgs = packet.props.packets.map((pk: any) => `#${pk.id}`)
    } else if(packet instanceof PacketBundle) {
      packetName = 'PacketBundle'
      packetArgs = packet.props.packets.map((pk: BundledPacket<any>) => `#${pk.id} (split: ${pk.props.hasSplit ? `#${pk.props.splitId} - ${pk.props.splitIndex}/${pk.props.splitCount}` : 'no'})`)
    } else if(packet instanceof Acknowledgement) {
      packetName = packet instanceof ACK ? 'ACK' : 'NAK'
      packetArgs = packet.props.sequences
    }

    this.logRaw(dir, packetName, packet.id, packetArgs)
  }

  public logRaw(dir: Direction, name = 'Packet', id: number, args?: Array<string | number>): void {
    const now = new Date()
    const time = now.toLocaleTimeString('en-GB', { hour12: false })
    console.log([
      chalk.yellow(`${time}:${now.getMilliseconds()}`),
      `[${dir === Direction.DOWNSTREAM ? `${this.Stardust}  ->  ${this.Client}` : `${this.Server}  ->  ${this.Stardust}`}]`,
      `${chalk.blueBright(name)}${args ? chalk.redBright(`[${args.join(', ')}]`) : chalk.greenBright(`#${id}`)}`,
    ].join(' '))
  }

}
