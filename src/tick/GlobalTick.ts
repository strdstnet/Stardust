import Logger from '@bwatton/logger'

interface ITicker {
  onTick: (tick?: number) => void | Promise<void>,
}

export abstract class GlobalTick {

  private static logger = new Logger('GlobalTick')

  private static started = false

  private static tickers: Set<ITicker> = new Set()

  private static process: NodeJS.Timeout | null = null

  public static start(ticksPerSecond: number): void {
    if(GlobalTick.started) throw new Error('Already started.')

    GlobalTick.process = setInterval(() => {
      this.tickers.forEach(async ticker => {
        ticker.onTick.call(ticker, Date.now())
      })
    }, 1000 / ticksPerSecond)

    GlobalTick.logger.info(`Started, ${ticksPerSecond}t/s`)
  }

  public static attach(ticker: ITicker): void {
    this.tickers.add(ticker)
  }

  public static detach(ticker: ITicker): void {
    this.tickers.delete(ticker)
  }

}