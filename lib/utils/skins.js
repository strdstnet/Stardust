"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkinData = exports.btoa = void 0;
function fromB64(base64) {
    return Buffer.from(base64, 'base64');
}
function btoa(base64) {
    return fromB64(base64).toString();
}
exports.btoa = btoa;
function getSkinData(data) {
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
        },
        animations: [],
        cape: {
            id: data.CapeId,
            image: {
                height: data.CapeImageHeight,
                width: data.CapeImageWidth,
                data: fromB64(data.CapeData),
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
            type: piece.PieceType,
            packId: piece.PackId,
            defaultPiece: piece.IsDefault,
            productId: piece.ProductId,
        })),
        personaPieceTints: data.PieceTintColors.map(tint => ({
            type: tint.PieceType,
            colors: tint.Colors,
        })),
        verified: true,
    };
}
exports.getSkinData = getSkinData;
