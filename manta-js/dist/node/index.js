"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaces = exports.MantaUtilities = exports.Environment = exports.Network = exports.MantaPrivateWallet = void 0;
var privateWallet_1 = require("./privateWallet");
Object.defineProperty(exports, "MantaPrivateWallet", { enumerable: true, get: function () { return privateWallet_1.MantaPrivateWallet; } });
Object.defineProperty(exports, "Network", { enumerable: true, get: function () { return privateWallet_1.Network; } });
Object.defineProperty(exports, "Environment", { enumerable: true, get: function () { return privateWallet_1.Environment; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "MantaUtilities", { enumerable: true, get: function () { return utils_1.MantaUtilities; } });
var interfaces = __importStar(require("./sdk.interfaces"));
exports.interfaces = interfaces;
