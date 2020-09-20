import { ICommand, ICommandExecute, ICreateCommand } from '../types/commands'

export abstract class Command implements ICommand {

  public name: string
  public triggers: string[]
  public description: string
  private argsUsage: string

  constructor({ name, triggers, description, usage }: ICreateCommand) {
    this.name = name
    this.triggers = Array.from(new Set(triggers))
    this.description = description || ''
    this.argsUsage = usage || ''
  }

  public getUsage(trigger: string): string {
    return `Usage: /${trigger} ${this.argsUsage}`
  }

  public abstract async execute(args: ICommandExecute): Promise<void>

}
