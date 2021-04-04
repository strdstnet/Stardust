import { AddPlayer } from '@strdstnet/protocol'
import { MetadataFlag, MetadataType, UUID, Vector3, Metadata } from '@strdstnet/utils.binary'
import { Event } from '@strdstnet/utils.events'
import { Entity } from '.'
import { Player } from '../Player'
import { Human } from './Human'

type NPCEvents = {
  NPCClick: Event<{
    player: Player
  }>
}

export class NPC extends Human<NPCEvents> {
  constructor() {
    super('NPC', 'minecraft:npc')
  }

  public spawnTag(name: string, player: Player) {
    const id = BigInt(++Entity.entityCount)
    const meta = new Metadata()

    meta.add(MetadataFlag.SCALE, MetadataType.FLOAT, 0.0)

    const position = new Vector3(this.position.x, this.position.y + 2.0, this.position.z)

    const packet = new AddPlayer({
      uuid: UUID.random(),
      username: name,
      entityUniqueId: id,
      entityRuntimeId: id,
      position,
      motion: this.position.motion,
      pitch: this.position.pitch,
      yaw: this.position.yaw,
      headYaw: this.position.headYaw,
      metadata: meta
    })
    player.client.sendBatched(packet)
  }
}