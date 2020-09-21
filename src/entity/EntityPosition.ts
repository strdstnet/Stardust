import { Vector3 } from 'math3d'

export enum PosUpdateType {
  NONE,
  PLAYER_MOVEMENT,
  OTHER,
}

export class EntityPosition {

  public updateType = PosUpdateType.OTHER

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public pitch: number,
    public yaw: number,
    public headYaw: number = 0,
    public motion = new Vector3(0, 0, 0),
    public onGround = false,
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
    if(args.length === 2) {
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

}