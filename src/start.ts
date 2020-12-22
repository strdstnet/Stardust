import * as _Stardust from './index'

// eslint-disable-next-line no-var
global.Stardust = _Stardust

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
