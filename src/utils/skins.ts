import { PersonaPieceType, PersonaTintablePieceType, SkinData } from '../types/player'
import { IClientData } from '../types/protocol'

function fromB64(base64: string): Buffer {
  return Buffer.from(base64, 'base64')
}

export function btoa(base64: string): string {
  return fromB64(base64).toString()
}

export function getSkinData(data: IClientData): SkinData {
  return {
    id: data.SkinId,
    armSize: data.ArmSize,
    color: data.SkinColor,
    resourcePatch: fromB64(data.SkinResourcePatch),
    // resourcePatch: data.SkinResourcePatch,
    image: {
      height: data.SkinImageHeight,
      width: data.SkinImageWidth,
      data: fromB64(data.SkinData),
      // data: data.SkinData,
    },
    animations: [],
    cape: {
      id: data.CapeId,
      image: {
        height: data.CapeImageHeight,
        width: data.CapeImageWidth,
        data: fromB64(data.CapeData),
        // data: data.CapeData,
      },
    },
    geometryData: fromB64(data.SkinGeometryData),
    // geometryData: data.SkinGeometryData,
    animationData: fromB64(data.SkinAnimationData),
    // animationData: data.SkinAnimationData,
    premium: data.PremiumSkin,
    persona: data.PersonaSkin,
    personaCapeOnClassic: data.CapeOnClassicSkin,
    personaPieces: data.PersonaPieces.map(piece => ({
      id: piece.PieceId,
      type: piece.PieceType as PersonaPieceType,
      packId: piece.PackId,
      defaultPiece: piece.IsDefault,
      productId: piece.ProductId,
    })),
    personaPieceTints: data.PieceTintColors.map(tint => ({
      type: tint.PieceType as PersonaTintablePieceType,
      colors: tint.Colors,
    })),
    verified: true,
  }
}