import Logger from '@bwatton/logger'
import { Event, EventEmitter } from '@strdstnet/utils.events'
import { PluginManager } from './PluginManager'

interface IPluginManifest {
  name: string,
  version: string,
}

export class PluginEnabledEvent extends Event<{
  manager: PluginManager,
}> {

  public get manager(): PluginManager {
    return this.data.manager
  }

}

type PluginEvents = {
  enabled: PluginEnabledEvent,
}

export abstract class Plugin extends EventEmitter<PluginEvents> {

  protected logger: Logger

  constructor(public manifest: IPluginManifest) {
    super()

    this.logger = new Logger(manifest.name)
  }

}
