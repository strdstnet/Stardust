import './index'
import '@strdstnet/protocol'
import '@strdstnet/utils.events'
import '@strdstnet/utils.binary'
import '@strdst/utils.nbt'

declare global {
  declare namespace Stardust {
    export * from './index'
  }

  declare namespace Protocol {
    export * from '@strdstnet/protocol'
  }

  declare namespace Events {
    export * from '@strdstnet/utils.events'
  }

  declare namespace Binary {
    export * from '@strdstnet/utils.binary'
  }

  declare namespace NBT {
    export * from '@strdst/utils.nbt'
  }
}
