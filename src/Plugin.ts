import { Event, EventEmitter } from '@hyperstonenet/utils.events'
import { Server } from './Server'

type PluginEvents = {
  enabled: Event<{
    server: Server,
  }>,
}

export abstract class Plugin extends EventEmitter<PluginEvents> {



}
