var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import axios from 'axios';
import config from './manta-config.json';
import BN from 'bn.js';
import { MantaPrivateWallet } from './privateWallet';
export var NATIVE_TOKEN_ASSET_ID = '1';
/// MantaUtilities class
var MantaUtilities = /** @class */ (function () {
    function MantaUtilities() {
    }
    /// Returns the version of the currently connected manta-signer instance.
    /// Note: Requires manta-signer to be running.
    MantaUtilities.getSignerVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versionResult, version, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios.get("".concat(config.SIGNER_URL, "version"), {
                                timeout: 1500
                            })];
                    case 1:
                        versionResult = _a.sent();
                        version = versionResult.data;
                        return [2 /*return*/, version];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /// Returns the public balance associated with an account for a given AssetId.
    MantaUtilities.getPublicBalance = function (api, assetId, address) {
        return __awaiter(this, void 0, void 0, function () {
            var nativeBalance, assetBalance, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(assetId.toString() === NATIVE_TOKEN_ASSET_ID)) return [3 /*break*/, 2];
                        return [4 /*yield*/, api.query.system.account(address)];
                    case 1:
                        nativeBalance = _a.sent();
                        return [2 /*return*/, new BN(nativeBalance.data.free.toString())];
                    case 2: return [4 /*yield*/, api.query.assets.account(assetId, address)];
                    case 3:
                        assetBalance = _a.sent();
                        if (assetBalance.value.isEmpty) {
                            return [2 /*return*/, new BN(0)];
                        }
                        else {
                            return [2 /*return*/, new BN(assetBalance.value.balance.toString())];
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        console.log('Failed to fetch public balance.');
                        console.error(e_1);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /// Executes a public transfer.
    MantaUtilities.publicTransfer = function (api, assetId, amount, destinationAddress, senderAddress, polkadotSigner) {
        return __awaiter(this, void 0, void 0, function () {
            var assetIdArray, amountBN, tx, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api.setSigner(polkadotSigner);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        assetIdArray = Array.from(MantaPrivateWallet.assetIdToUInt8Array(assetId));
                        amountBN = amount.toArray('le', 16);
                        return [4 /*yield*/, api.tx.mantaPay.publicTransfer({ id: assetIdArray, value: amountBN }, destinationAddress)];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.signAndSend(senderAddress)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        console.log('Failed to execute public transfer.');
                        console.error(e_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return MantaUtilities;
}());
export { MantaUtilities };
