import path from 'path'
import { Plugin, PluginEnabledEvent } from './Plugin'

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

  private async loadFromPDN(name: string, version: string): Promise<Plugin> {
    return null as any
  }

  private async loadFromLocalProj(projPath: string): Promise<Plugin> {
    const { name, version, main } = (await import(path.join(projPath, 'package.json'))).default

    const mainPath = path.join(projPath, main || 'src/index.ts')

    const Plug = (await import(mainPath)).default
    return new Plug({ name, version }, this)
  }

  public static async init(plugins: string[]): Promise<PluginManager> {
    const manager = new PluginManager()

    for(const plugin of plugins) {
      const [type, details] = plugin.split(':')

      const typeL = type.toLowerCase()
      let plugInstance: Plugin
      if(typeL === 'pdn') {
        const [name, version] = plugin.split('@')
        plugInstance = await manager.loadFromPDN(name, version)
      } else if(typeL === 'local') {
        plugInstance = await manager.loadFromLocalProj(details)
      } else {
        throw new Error(`Unknown plugin type: ${type}`)
      }

      manager.registerPlugin(plugInstance)
    }

    return manager
  }

}

import { Server } from '../Server'
