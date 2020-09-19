"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplayerVisibility = exports.FamilyStrToInt = exports.FamilyIntToStr = exports.AddressFamilyStr = exports.AddressFamily = void 0;
var AddressFamily;
(function (AddressFamily) {
    AddressFamily[AddressFamily["IPV4"] = 4] = "IPV4";
    AddressFamily[AddressFamily["IPV6"] = 6] = "IPV6";
})(AddressFamily = exports.AddressFamily || (exports.AddressFamily = {}));
var AddressFamilyStr;
(function (AddressFamilyStr) {
    AddressFamilyStr["IPV4"] = "IPv4";
    AddressFamilyStr["IPV6"] = "IPv6";
})(AddressFamilyStr = exports.AddressFamilyStr || (exports.AddressFamilyStr = {}));
exports.FamilyIntToStr = {
    [AddressFamily.IPV4]: AddressFamilyStr.IPV4,
    [AddressFamily.IPV6]: AddressFamilyStr.IPV6,
};
exports.FamilyStrToInt = {
    [AddressFamilyStr.IPV4]: AddressFamily.IPV4,
    [AddressFamilyStr.IPV6]: AddressFamily.IPV6,
};
var MultiplayerVisibility;
(function (MultiplayerVisibility) {
    MultiplayerVisibility[MultiplayerVisibility["NONE"] = 0] = "NONE";
    MultiplayerVisibility[MultiplayerVisibility["INVITE"] = 1] = "INVITE";
    MultiplayerVisibility[MultiplayerVisibility["FRIENDS"] = 2] = "FRIENDS";
    MultiplayerVisibility[MultiplayerVisibility["FRIENDS_OF_FRIENDS"] = 3] = "FRIENDS_OF_FRIENDS";
    MultiplayerVisibility[MultiplayerVisibility["PUBLIC"] = 4] = "PUBLIC";
})(MultiplayerVisibility = exports.MultiplayerVisibility || (exports.MultiplayerVisibility = {}));
