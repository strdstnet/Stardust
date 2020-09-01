export class Event<A extends any[] = any[]> {

  protected args: A

  private cancelled = false

  constructor(...args: A) {
    this.args = args
  }

  public get isCancelled(): boolean {
    return this.cancelled
  }

  public cancel(): void {
    this.cancelled = true
  }

}
