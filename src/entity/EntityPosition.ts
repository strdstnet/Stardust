import { Vector3 } from '@strdstnet/utils.binary'

export enum PosUpdateType {
  NONE,
  PLAYER_MOVEMENT,
  OTHER,
}

export class EntityPosition {

  public updateType = PosUpdateType.NONE

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public pitch: number,
    public yaw: number,
    public headYaw: number = 0,
    public motion = new Vector3(0, 0, 0),
    public onGround = true,
  ) {}

  public get coords(): Vector3 {
    return new Vector3(this.x, this.y, this.z)
  }

  /** @deprecated Use pos.x, pos.y & pos.z instead, or pos.coords if you ***need*** a Vector3 */
  public get location(): Vector3 {
    return this.coords
  }

  public update(x: number, y: number, z: number, type?: PosUpdateType): void
  public update(newPos: EntityPosition, type?: PosUpdateType): void
  public update(...args: any[]): void {
    if(args.length < 3) {
      const newPos = args[0] as EntityPosition

      this.x = newPos.x
      this.y = newPos.y
      this.z = newPos.z
      this.pitch = newPos.pitch
      this.yaw = newPos.yaw
      this.headYaw = newPos.headYaw
      this.motion = newPos.motion

      this.updateType = args[1] || PosUpdateType.OTHER
    } else {
      this.x = args[0]
      this.y = args[1]
      this.z = args[2]

      this.updateType = args[3] || PosUpdateType.OTHER
    }
  }

  public get hasUpdate(): boolean {
    return this.updateType !== PosUpdateType.NONE
    // return this.motion.x !== 0 || this.motion.y !== 0 || this.motion.z !== 0 || !this.onGround
  }

  public acknowledgeUpdate(): void {
    this.updateType = PosUpdateType.NONE
    // this.updateType = PosUpdateType.OTHER
  }

  public equals(pos: EntityPosition): boolean {
    return (
      pos.x === this.x &&
      pos.y === this.y &&
      pos.z === this.z &&
      pos.pitch === this.pitch &&
      pos.yaw === this.yaw &&
      pos.headYaw === this.headYaw &&
      pos.onGround === this.onGround &&
      pos.motion.x === this.motion.x &&
      pos.motion.y === this.motion.y &&
      pos.motion.z === this.motion.z
    )
  }

  public clone(): EntityPosition {
    return new EntityPosition(this.x, this.y, this.z, this.pitch, this.yaw, this.headYaw, this.motion, this.onGround)
  }

  public round(): EntityPosition {
    const clone = this.clone()

    clone.x = Math.round(clone.x)
    clone.y = Math.round(clone.y)
    clone.z = Math.round(clone.z)

    return clone
  }

  public static from(v3: Vector3, pitch = 0, yaw = 0, headYaw = 0, motion = new Vector3(0, 0, 0), onGround = true): EntityPosition {
    return new EntityPosition(v3.x, v3.y, v3.z, pitch, yaw, headYaw, motion, onGround)
  }

  public forSpawn(): EntityPosition {
    const pos = this.clone()

    pos.y += 1.5

    return pos
  }

}