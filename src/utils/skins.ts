import { IClientData, SkinData, PersonaPieceType, PersonaTintablePieceType } from '../types'

export function btoa(base64: string): string {
  return Buffer.from(base64, 'base64').toString()
}

export function getSkinData(data: IClientData): SkinData {
  return {
    id: data.SkinId,
    armSize: data.ArmSize,
    color: data.SkinColor,
    resourcePatch: btoa(data.SkinResourcePatch),
    image: {
      height: data.SkinImageHeight,
      width: data.SkinImageWidth,
      data: btoa(data.SkinData),
    },
    animations: [],
    cape: {
      id: data.CapeId,
      image: {
        height: data.CapeImageHeight,
        width: data.CapeImageWidth,
        data: btoa(data.CapeData),
      },
    },
    geometryData: btoa(data.SkinGeometryData),
    animationData: btoa(data.SkinAnimationData),
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