import fs from 'fs-extra'
import path from 'path'
import { Plugin, PluginEnabledEvent } from './Plugin'

const PLUGIN_DIR = path.join(__dirname, '..', 'plugins')

export class PluginManager {

  public static i: PluginManager

  private constructor() {
    PluginManager.i = this
  }

  public get server(): Server {
    return Server.i
  }

  private registerPlugin(plugin: Plugin) {
    plugin.emit('enabled', new PluginEnabledEvent({
      manager: this,
    }))
  }

  public static async start(): Promise<PluginManager> {
    const manager = new PluginManager()

    // const items = fs.readdirSync(PLUGIN_DIR)
    const items = []

    for(const item of items) {
      const PATH = path.join(PLUGIN_DIR, item)

      const stat = fs.statSync(PATH)
      if(!stat.isDirectory()) continue

      const module = await import(PATH)

      if(module.default && module.default.prototype instanceof Plugin) {
        const plugin = (new (module.default)()) as Plugin

        manager.registerPlugin(plugin)
      }
    }

    return manager
  }

}

import { Server } from './Server'
