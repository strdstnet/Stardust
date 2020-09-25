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
  ENTITY_METADATA,
  BYTE_ROTATION,
}
