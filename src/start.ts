import './types/protocol'
import './types/server'

import Logger from '@bwatton/logger'

Logger.defaults.showMilliseconds = true

import { Server } from './Server'

Server.start({
  port: process.argv[2] ? parseInt(process.argv[2]) : 19132,
  level: process.argv[3] ? process.argv[3] : 'hsn',
  maxPlayers: 200000,
  motd: {
    line1: 'HyperstoneNetwork',
    line2: 'test',
  },
})

// const logger = new Logger('V8::GC')
// gcWatch.on('beforeGC', () => {
//   logger.info('Preparing for garbage collection...', `${process.memoryUsage().heapUsed / 1024 / 1024} MB`)
// })
// gcWatch.on('afterGC', () => {
//   logger.info('Garbage collection complete.', `${process.memoryUsage().heapUsed / 1024 / 1024} MB`)
// })
