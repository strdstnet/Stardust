import { Vector3 } from 'math3d'

export type Props = Record<string, never>

export const FLOAT_MAX_VAL = 340282346638528859811704183484516925440

export enum DataType {
  BYTE,
  LONG,
  MAGIC,
  INT,
  SHORT,
  STRING,     // with length prefixed
  RAW_STRING, // without length prefixed
  SECURITY,
  BOOLEAN,
  ADDRESS,
  L_INT,
  L_TRIAD,
  L_SHORT,
  L_FLOAT,
  L_LONG,
  VECTOR3_FLOAT,
  VECTOR3_VARINT,
  VECTOR3,
  VARINT,
  U_VARINT,
  VARLONG,
  U_VARLONG,
  CONTAINER_ITEM,
  CHUNK,
  UUID,
}

export class PlayerPosition {

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public pitch: number,
    public yaw: number,
    public headYaw: number = 0,
    public motion = new Vector3(0, 0, 0),
  ) {}

  public get coords(): Vector3 {
    return new Vector3(this.x, this.y, this.z)
  }

  /** @deprecated Use pos.x, pos.y & pos.z instead, or pos.coords if you ***need*** a Vector3 */
  public get location(): Vector3 {
    return this.coords
  }

  public update(newPos: PlayerPosition): void {
    this.x = newPos.x
    this.y = newPos.y
    this.z = newPos.z
    this.pitch = newPos.pitch
    this.yaw = newPos.yaw
    this.headYaw = newPos.headYaw
    this.motion = newPos.motion
  }

}
