import { Vector3 } from '@strdstnet/utils.binary'
import { BlockMap } from '../block'
import { Entity, PosUpdateType } from '../entity'
import { Server } from '../Server'
import { BoundingBox } from '../utils'
import { PhysicsVector3 } from './PhysicsVector3'

interface IPhysics {
  gravity: number,
  waterGravity: number,
  lavaGravity: number,
  drag: number,
  airDrag: number,
  yawSpeed: number,
  sprintSpeed: number,
  sneakSpeed: number,
  stepHeight: number,
  negligeableVelocity: number,
  soulsandSpeed: number,
  honeyblockSpeed: number,
  honeyblockJumpSpeed: number,
  ladderMaxSpeed: number,
  ladderClimbSpeed: number,
  waterInertia: number,
  lavaInertia: number,
  liquidAcceleration: number,
  airborneInertia: number,
  airborneAcceleration: number,
  defaultSlipperiness: number,
  outOfLiquidImpulse: number,
  autojumpCooldown: number, // ticks (0.5s)
  bubbleColumnSurfaceDrag: {
    down: number,
    maxDown: number,
    up: number,
    maxUp: number,
  },
  bubbleColumnDrag: {
    down: number,
    maxDown: number,
    up: number,
    maxUp: number,
  },
  slowFalling: number,
  speedEffect: number,
  slowEffect: number,
}

const def = (val: number | undefined, defVal: number) => typeof val === 'undefined' ? defVal : val

export class Physics {

  public readonly properties: IPhysics

  public onGround = false
  public inWater = false
  public inLava = false
  public inWeb = false
  public slowFalling = false

  public isHCollided = false
  public isVCollided = false

  public depthStrider = 3
  // public dolphinsGrace = 3

  public speed = 0

  protected motion!: PhysicsVector3
  protected pos!: PhysicsVector3

  constructor(public entity: Entity, properties: Partial<IPhysics> = {}) {
    const gravity = def(properties.gravity, 0.08)
    const drag = def(properties.drag, 0.02)

    this.properties = {
      gravity, // blocks/tick^2 https://minecraft.gamepedia.com/Entity#Motion_of_entities
      waterGravity: gravity / 16,
      lavaGravity: gravity / 4,
      drag,
      airDrag: (1 - drag),
      yawSpeed: 3.0,
      sprintSpeed: 1.3,
      sneakSpeed: 0.3,
      stepHeight: 0.6, // how much height can the entity step on without jump
      negligeableVelocity: 0.003,
      soulsandSpeed: 0.4,
      honeyblockSpeed: 0.4,
      honeyblockJumpSpeed: 0.4,
      ladderMaxSpeed: 0.15,
      ladderClimbSpeed: 0.2,
      waterInertia: 0.8,
      lavaInertia: 0.5,
      liquidAcceleration: 0.02,
      airborneInertia: 0.91,
      airborneAcceleration: 0.02,
      defaultSlipperiness: 0.6,
      outOfLiquidImpulse: 0.3,
      autojumpCooldown: Server.TPS / 2, // ticks (0.5s)
      bubbleColumnSurfaceDrag: {
        down: 0.03,
        maxDown: -0.9,
        up: 0.1,
        maxUp: 1.8,
      },
      bubbleColumnDrag: {
        down: 0.03,
        maxDown: -0.3,
        up: 0.06,
        maxUp: 0.7,
      },
      slowFalling: 0.125,
      speedEffect: 1.2,
      slowEffect: 0.85,
      ...properties,
    }
  }

  public async doPhysics(): Promise<void> {
    this.motion = PhysicsVector3.from(this.entity.position.motion)
    this.pos = PhysicsVector3.from(this.entity.position.coords)

    this.motion.apply(await this.doLiquidPhysics())

    if(Math.abs(this.motion.x) < this.properties.negligeableVelocity) this.motion.x = 0
    if(Math.abs(this.motion.y) < this.properties.negligeableVelocity) this.motion.y = 0
    if(Math.abs(this.motion.z) < this.properties.negligeableVelocity) this.motion.z = 0

    this.doGravity()

    this.entity.position.motion = this.motion

    if(
      this.pos.x !== this.entity.position.x ||
      this.pos.y !== this.entity.position.y ||
      this.pos.z !== this.entity.position.z
    ) {
      // console.log('UPDATE')
      this.entity.move(this.pos.x, this.pos.y, this.pos.z)
    }
  }

  protected async doLiquidPhysics(): Promise<PhysicsVector3> {
    const motion = new PhysicsVector3(0, 0, 0)

    // Water
    const waterBB = this.entity.boundingBox.contract(0.001, 0.401, 0.001)
    const waterBlocks = await this.entity.level.getBlocksInBB(waterBB, block => block.waterLogged || BlockMap.WATERLIKE_BLOCKS.includes(block.nid))
    this.inWater = waterBlocks.length > 0

    // TODO: Water current physics

    // Lava
    const lavaBB = this.entity.boundingBox.contract(0.1, 0.4, 0.1)
    const lavaBlocks = await this.entity.level.getBlocksInBB(lavaBB, block => block.nid === 'minecraft:lava')
    this.inLava = lavaBlocks.length > 0

    return motion
  }

  protected async doGravity(): Promise<void> {
    const multiplier = (this.motion.y <= 0 && this.slowFalling) ? this.properties.slowFalling : 1

    if(this.inWater || this.inLava) {
      const lastY = this.pos.y
      let accel = this.properties.liquidAcceleration
      const vInertia = this.inWater ? this.properties.waterInertia : this.properties.lavaInertia
      let hIntertia = vInertia

      if(this.inWater) {
        let strider = Math.min(this.depthStrider, 3)
        if(!this.onGround) {
          strider *= 0.5
        }
        if(strider > 0) {
          hIntertia += (0.546 - hIntertia) * strider / 3
          accel += (0.7 - accel) * strider / 3
        }

        // if (this.dolphinsGrace > 0) hIntertia = 0.96
      }

      this.moveEntity(this.motion)
      this.motion.y *= vInertia
      this.motion.y -= (this.inWater ? this.properties.waterGravity : this.properties.lavaGravity) * multiplier
      this.motion.x *= hIntertia
      this.motion.z *= hIntertia
    } else {
      let accel = this.properties.airborneAcceleration
      let inertia = this.properties.airborneInertia

      const underPos = this.pos.offset(0, -1, 0)
      if(underPos.y <= 0) {
        this.onGround = true
      } else {
        const blockUnder = await this.entity.level.getBlockAt(underPos.x, underPos.y, underPos.z)
        this.onGround = blockUnder.nid !== 'minecraft:air'
      }

      if(this.onGround) {
        inertia = this.properties.defaultSlipperiness * 0.91 // TODO: Block slipperiness
        accel = 0.1 * (0.1627714 / (inertia * inertia * inertia))
      }

      if(this.speed > 0) accel *= this.properties.speedEffect * this.speed
      if(this.speed < 0) accel *= this.properties.slowEffect * Math.abs(this.speed)

      this.moveEntity(this.motion)

      this.motion.y -= this.properties.gravity * multiplier
      this.motion.y *= this.properties.airDrag
      this.motion.x *= inertia
      this.motion.z *= inertia
    }
  }

  public async moveEntity(motion: PhysicsVector3): Promise<void> {
    if(this.inWeb) {
      motion.x *= 0.25
      motion.y *= 0.05
      motion.z *= 0.25
      this.entity.position.motion.x = 0
      this.entity.position.motion.y = 0
      this.entity.position.motion.z = 0
      this.inWeb = false // To prevent slowing entity down exponentially
    }

    const oldMX = motion.x
    const oldMY = motion.y
    const oldMZ = motion.z

    const oldBB = this.entity.boundingBox
    const entityBB = this.entity.boundingBox
    // const queryBB = this.entity.boundingBox.extend(motion.x, motion.y, motion.z)
    // const surroundingBlocks = await this.entity.level.getBlocksInBB(queryBB)

    // for(const [, v3] of surroundingBlocks) {
    //   motion.y = this.computeOffsetY(BoundingBox.from(v3), entityBB, motion.y)
    // }
    // entityBB.offset(0, motion.y, 0)

    // for(const [, v3] of surroundingBlocks) {
    //   motion.x = this.computeOffsetX(BoundingBox.from(v3), entityBB, motion.x)
    // }
    // entityBB.offset(motion.x, 0, 0)

    // for(const [, v3] of surroundingBlocks) {
    //   motion.z = this.computeOffsetZ(BoundingBox.from(v3), entityBB, motion.z)
    // }
    // entityBB.offset(0, 0, motion.z)

    // console.log('  - 1:', this.motion)

    this.isHCollided = motion.x !== oldMX || motion.z !== oldMZ
    this.isVCollided = motion.y !== oldMY
    // this.onGround = this.isVCollided && oldMY < 0

    this.pos.x = entityBB.minX + (this.entity.dimensions[0] / 2)
    this.pos.y = entityBB.minY
    this.pos.z = entityBB.minZ + (this.entity.dimensions[0] / 2)

    const base = this.pos.offset(0, -0.2, 0)
    const blockAtBase = base.y > 0 ? await this.entity.level.getBlockAt(base.x, base.y, base.z) : null

    // if(motion.x !== oldMX) this.entity.position.motion.x = 0
    // if(motion.z !== oldMX) this.entity.position.motion.z = 0
    if(motion.y !== oldMY) {
      if(blockAtBase && blockAtBase.nid === 'minecraft:slime') {
        this.entity.position.motion.y = -this.entity.position.motion.y
      } else {
        this.entity.position.motion.y = 0
      }
    }

    this.pos.x += this.entity.position.motion.x
    this.pos.y += this.entity.position.motion.y
    this.pos.z += this.entity.position.motion.z

    // TODO: Block collisions (web, soulsand...)
  }

  protected getBBVal(type: 'max' | 'min', axis: 'x' | 'y' | 'z', box: BoundingBox): number {
    return (box as any)[`${type}${axis.toUpperCase()}`] as number
  }

  protected computeOffsetX(boxA: BoundingBox, boxB: BoundingBox, offsetX: number): number {
    if(boxB.maxY > boxA.minY && boxB.minY < boxA.maxY && boxB.maxZ > boxA.minZ && boxB.minZ < boxA.maxZ) {
      if(offsetX > 0.0 && boxB.maxX <= boxA.minX) {
        offsetX = Math.min(boxA.minX - boxB.maxX, offsetX)
      } else if(offsetX < 0.0 && boxB.minX >= boxA.maxX) {
        offsetX = Math.max(boxA.maxX - boxB.minX, offsetX)
      }
    }
    return offsetX
  }

  protected computeOffsetY(boxA: BoundingBox, boxB: BoundingBox, offsetY: number): number {
    if (boxB.maxX > boxA.minX && boxB.minX < boxA.maxX && boxB.maxZ > boxA.minZ && boxB.minZ < boxA.maxZ) {
      if (offsetY > 0.0 && boxB.maxY <= boxA.minY) {
        offsetY = Math.min(boxA.minY - boxB.maxY, offsetY)
      } else if (offsetY < 0.0 && boxB.minY >= boxA.maxY) {
        offsetY = Math.max(boxA.maxY - boxB.minY, offsetY)
      }
    }
    return offsetY
  }

  protected computeOffsetZ(boxA: BoundingBox, boxB: BoundingBox, offsetZ: number): number {
    if (boxB.maxX > boxA.minX && boxB.minX < boxA.maxX && boxB.maxY > boxA.minY && boxB.minY < boxA.maxY) {
      if (offsetZ > 0.0 && boxB.maxZ <= boxA.minZ) {
        offsetZ = Math.min(boxA.minZ - boxB.maxZ, offsetZ)
      } else if (offsetZ < 0.0 && boxB.minZ >= boxA.maxZ) {
        offsetZ = Math.max(boxA.maxZ - boxB.minZ, offsetZ)
      }
    }
    return offsetZ
  }

}
