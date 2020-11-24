import chalk from 'chalk'
import { CommandHandler } from '../command/CommandHandler'
import { InvalidCommand, InvalidExecutor } from '../command/errors'
import { ChatFormat } from '../Chat'
import { Server } from '../Server'

const formats: {
  [k in ChatFormat]: string
} = {
  [ChatFormat.RED]: '\u001b[31m',
  [ChatFormat.LIGHT_PURPLE]: '\u001b[35m',
  [ChatFormat.YELLOW]: '\u001b[33m',

  [ChatFormat.RESET]: '\u001b[0m',
}

export class Console {

  public static i: Console

  protected constructor() {
    process.openStdin().addListener('data', d => this.onData(d))

    setInterval(() => {
      this.setTitle(`Stardust - ${Server.i.numPlayers}/${Server.i.maxPlayers}`)
    }, 1000)
  }

  public static async init(): Promise<Console> {
    return Console.i || (Console.i = new Console())
  }

  public get name(): string {
    return 'CONSOLE'
  }

  public setTitle(title: string): void {
    process.stdout.write(`${String.fromCharCode(27)}]0;${title}${String.fromCharCode(7)}`)
  }

  protected onData(data: Buffer): void {
    const str = data.toString().trim()
    if(!str) return

    const [ trigger, ...args ] = CommandHandler.parse(str)

    CommandHandler.handle(trigger, this, args)
      .catch(e => {
        if(e instanceof InvalidCommand) {
          this.sendMessage(`${ChatFormat.RED}Unknown command '${trigger}'`)
        } else if(e instanceof InvalidExecutor) {
          this.sendMessage(`${ChatFormat.RED}That command cannot be ran as ${this.name}`)
        } else {
          throw e
        }
      })
  }

  private reformat(input: string): string {
    input += ChatFormat.RESET
    Object.entries(formats).forEach(([k, v]) => input = input.replace(new RegExp(k), v))

    return input
  }

  public sendMessage(message: string): void {
    console.log(this.reformat(message))
  }

}