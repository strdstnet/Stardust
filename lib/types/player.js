"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaPieceType = exports.PersonaTintablePieceType = exports.SkinAnimationType = void 0;
var SkinAnimationType;
(function (SkinAnimationType) {
    SkinAnimationType[SkinAnimationType["HEAD"] = 1] = "HEAD";
    SkinAnimationType[SkinAnimationType["BODY_32"] = 2] = "BODY_32";
    SkinAnimationType[SkinAnimationType["BODY_64"] = 3] = "BODY_64";
})(SkinAnimationType = exports.SkinAnimationType || (exports.SkinAnimationType = {}));
var PersonaTintablePieceType;
(function (PersonaTintablePieceType) {
    PersonaTintablePieceType["EYES"] = "persona_eyes";
    PersonaTintablePieceType["HAIR"] = "persona_hair";
    PersonaTintablePieceType["MOUTH"] = "persona_mouth";
})(PersonaTintablePieceType = exports.PersonaTintablePieceType || (exports.PersonaTintablePieceType = {}));
var PersonaPieceType;
(function (PersonaPieceType) {
    PersonaPieceType["BODY"] = "persona_body";
    PersonaPieceType["BOTTOM"] = "persona_bottom";
    PersonaPieceType["EYES"] = "persona_eyes";
    PersonaPieceType["FACIAL_HAIR"] = "persona_facial_hair";
    PersonaPieceType["FEET"] = "persona_feet";
    PersonaPieceType["HAIR"] = "persona_hair";
    PersonaPieceType["MOUTH"] = "persona_mouth";
    PersonaPieceType["SKELETON"] = "persona_skeleton";
    PersonaPieceType["SKIN"] = "persona_skin";
    PersonaPieceType["TOP"] = "persona_top";
})(PersonaPieceType = exports.PersonaPieceType || (exports.PersonaPieceType = {}));
