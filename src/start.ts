import './types/protocol'
import './types/server'

import Logger from '@bwatton/logger'

Logger.defaults.showMilliseconds = true

import { Server } from './Server'

Server.start({
  port: 19131,
  maxPlayers: 200000,
  motd: {
    line1: 'HyperstoneNetwork',
    line2: 'https://hyperstone.io',
  },
})
