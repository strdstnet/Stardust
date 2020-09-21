import { Vector3 } from 'math3d'
import { EntityPosition } from '../../../entity/EntityPosition'
import { StartGame } from '../../../network/bedrock/StartGame'
import { GameRuleType } from '../../../types/world'

describe('StartGame', () => {
  it('encodes & decodes correctly', () => {
    const props = {
      entityUniqueId: 1n,
      entityRuntimeId: 1n,
      playerPosition: new EntityPosition(0, 0, 0, 0, 0),
    }

    const encoded = new StartGame(props).encode()

    const decoded = new StartGame().parse(encoded.clone()).props

    expect(decoded.entityUniqueId).toEqual(props.entityUniqueId)
    expect(decoded.entityRuntimeId).toEqual(props.entityRuntimeId)
    expect(decoded.playerPosition).toEqual(props.playerPosition)
    expect(decoded.seed).toEqual(0)
    expect(decoded.biomeType).toEqual(0)
    expect(decoded.biomeName).toEqual('')
    expect(decoded.dimension).toEqual(0)
    expect(decoded.generator).toEqual(1)
    expect(decoded.worldGamemode).toEqual(0)
    expect(decoded.difficulty).toEqual(0)
    expect(decoded.spawnLocation).toEqual(new Vector3(5, 5, 5))
    expect(decoded.achievementsDisabled).toEqual(true)
    expect(decoded.time).toEqual(0)
    expect(decoded.eduEditionOffer).toEqual(0)
    expect(decoded.eduFeaturesEnabled).toEqual(false)
    expect(decoded.eduProductUUID).toEqual('')
    expect(decoded.rainLevel).toEqual(0)
    expect(decoded.lightningLevel).toEqual(0)
    expect(decoded.hasConfirmedPlatformLockedContent).toEqual(false)
    expect(decoded.isMultiplayerGame).toEqual(true)
    expect(decoded.hasLANBroadcast).toEqual(true)
    expect(decoded.xboxLiveBroadcastMode).toEqual(4)
    expect(decoded.platformBroadcastMode).toEqual(4)
    expect(decoded.commandsEnabled).toEqual(true)
    expect(decoded.texturePacksRequired).toEqual(true)
    expect(decoded.gameRules).toEqual([{ name: 'naturalregeneration', type: GameRuleType.BOOL, value: false }])
    expect(decoded.bonusChestEnabled).toEqual(false)
    expect(decoded.startWithMapEnabled).toEqual(false)
    expect(decoded.defaultPlayerPermission).toEqual(1)
    expect(decoded.serverChunkTickRadius).toEqual(4)
    expect(decoded.hasLockedBehaviorPack).toEqual(false)
    expect(decoded.hasLockedResourcePack).toEqual(false)
    expect(decoded.fromLockedWorldTemplate).toEqual(false)
    expect(decoded.useMsaGamertagsOnly).toEqual(false)
    expect(decoded.fromWorldTemplate).toEqual(false)
    expect(decoded.worldTemplateOptionLocked).toEqual(false)
    expect(decoded.onlySpawnV1Villagers).toEqual(false)
    expect(decoded.vanillaVersion).toEqual('1.16.40')
    expect(decoded.limitedWorldWidth).toEqual(0)
    expect(decoded.limitedWorldLength).toEqual(0)
    expect(decoded.newNether).toEqual(true)
    expect(decoded.levelId).toEqual('')
    expect(decoded.worldName).toEqual('')
    expect(decoded.premiumWorldTemplateId).toEqual('')
    expect(decoded.isTrial).toEqual(false)
    expect(decoded.isMovementServerAuthoritative).toEqual(false)
    expect(decoded.currentTick).toEqual(0n)
    expect(decoded.enchantmentSeed).toEqual(0)
    expect(decoded.multiplayerCorrelationId).toEqual('')
    expect(decoded.enableNewInventorySystem).toEqual(false)

    console.log(decoded.legacyIdMap)
  })
})
