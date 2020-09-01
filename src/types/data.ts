export type Props = Record<string, never>

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
  L_TRIAD,
  L_SHORT,
  L_FLOAT,
  VECTOR3_FLOAT,
  VECTOR3_VARINT,
  VECTOR3,
  VARINT,
  U_VARINT,
  VARLONG,
  U_VARLONG,
}
