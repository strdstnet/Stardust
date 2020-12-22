import * as _Stardust from './index'
import * as _Protocol from '@strdstnet/protocol'
import * as _Binary from '@strdstnet/utils.binary'
import * as _Events from '@strdstnet/utils.events'
import * as _NBT from '@strdst/utils.nbt'

global.Stardust = _Stardust
global.Protocol = _Protocol
global.Binary = _Binary
global.Events = _Events
global.NBT = _NBT

import Logger from '@bwatton/logger'

Logger.defaults.showMilliseconds = true

Stardust.Server.start({
  port: process.argv[2] ? parseInt(process.argv[2]) : 19132,
  level: process.argv[3] ? process.argv[3] : 'bw2',
  maxPlayers: 200000,
  motd: {
    line1: 'HyperstoneNetwork',
    line2: 'test',
  },
})
