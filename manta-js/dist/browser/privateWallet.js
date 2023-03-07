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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { ApiPromise, WsProvider } from '@polkadot/api';
import { base58Decode, base58Encode } from '@polkadot/util-crypto';
// @ts-ignore
import Api, { ApiConfig } from './api/index';
import BN from 'bn.js';
import config from './manta-config.json';
import { NATIVE_TOKEN_ASSET_ID } from './utils';
var rpc = config.RPC;
var types = config.TYPES;
var DEFAULT_PULL_SIZE = config.DEFAULT_PULL_SIZE;
var SIGNER_URL = config.SIGNER_URL;
var PRIVATE_ASSET_PREFIX = 'zk';
/// The Envrionment that the sdk is configured to run for, if development
/// is selected then it will attempt to connect to a local node instance.
/// If production is selected it will attempt to connect to actual node.
export var Environment;
(function (Environment) {
    Environment["Development"] = "DEV";
    Environment["Production"] = "PROD";
})(Environment || (Environment = {}));
/// Supported networks.
export var Network;
(function (Network) {
    Network["Dolphin"] = "Dolphin";
    Network["Calamari"] = "Calamari";
    Network["Manta"] = "Manta";
})(Network || (Network = {}));
/// MantaPrivateWallet class
var MantaPrivateWallet = /** @class */ (function () {
    function MantaPrivateWallet(api, wasm, wasmWallet, network, wasmApi, loggingEnabled) {
        this.api = api;
        this.wasm = wasm;
        this.wasmWallet = wasmWallet;
        this.network = network;
        this.wasmApi = wasmApi;
        this.walletIsBusy = false;
        this.initialSyncIsFinished = false;
        this.loggingEnabled = loggingEnabled;
    }
    ///
    /// Public Methods
    ///
    /// Initializes the MantaPrivateWallet class, for a corresponding environment and network.
    MantaPrivateWallet.init = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var api, _a, wasm, wasmWallet, wasmApi;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        api = MantaPrivateWallet.initApi(config.environment, config.network, Boolean(config.loggingEnabled)).api;
                        return [4 /*yield*/, MantaPrivateWallet.initWasmSdk(api, config)];
                    case 1:
                        _a = _b.sent(), wasm = _a.wasm, wasmWallet = _a.wasmWallet, wasmApi = _a.wasmApi;
                        return [2 /*return*/, new MantaPrivateWallet(api, wasm, wasmWallet, config.network, wasmApi, Boolean(config.loggingEnabled))];
                }
            });
        });
    };
    /// Convert a private address to JSON.
    MantaPrivateWallet.prototype.convertPrivateAddressToJson = function (address) {
        var bytes = base58Decode(address);
        return JSON.stringify({
            receiving_key: Array.from(bytes)
        });
    };
    /// Convert asset_id string to UInt8Array, default UInt8 array size is 32.
    MantaPrivateWallet.assetIdToUInt8Array = function (asset_id, len) {
        if (len === void 0) { len = 32; }
        var hex = asset_id.toString(16); // to heximal format
        if (hex.length % 2) {
            hex = '0' + hex;
        }
        var u8a = new Uint8Array(len);
        var i = 0;
        var j = 0;
        while (i < len) {
            u8a[i] = parseInt(hex.slice(j, j + 2), 16);
            i += 1;
            j += 2;
        }
        return u8a;
    };
    /// Returns information about the currently supported networks.
    MantaPrivateWallet.prototype.getNetworks = function () {
        return config.NETWORKS;
    };
    /// Returns the ZkAddress (Private Address) of the currently connected manta-signer instance.
    MantaPrivateWallet.prototype.getZkAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var networkType, privateAddressRaw, privateAddressBytes, privateAddress, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 1:
                        _a.sent();
                        this.walletIsBusy = true;
                        networkType = this.wasm.Network.from_string("\"".concat(this.network, "\""));
                        return [4 /*yield*/, this.wasmWallet.address(networkType)];
                    case 2:
                        privateAddressRaw = _a.sent();
                        privateAddressBytes = __spreadArray([], privateAddressRaw.receiving_key, true);
                        privateAddress = base58Encode(privateAddressBytes);
                        this.walletIsBusy = false;
                        return [2 /*return*/, privateAddress];
                    case 3:
                        e_1 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Failed to fetch ZkAddress.', e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /// Performs full wallet recovery. Restarts `self` with an empty state and
    /// performs a synchronization against the signer and ledger to catch up to
    /// the current checkpoint and balance state.
    ///
    /// Requirements: Must be called once after creating an instance of MantaPrivateWallet
    /// and must be called before walletSync().
    MantaPrivateWallet.prototype.initalWalletSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var networkType, startTime, endTime, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        this.log('Beginning initial sync');
                        networkType = this.wasm.Network.from_string("\"".concat(this.network, "\""));
                        startTime = performance.now();
                        return [4 /*yield*/, this.wasmWallet.restart(networkType)];
                    case 3:
                        _a.sent();
                        endTime = performance.now();
                        this.log("Initial sync finished in ".concat((endTime - startTime) / 1000, " seconds"));
                        this.walletIsBusy = false;
                        this.initialSyncIsFinished = true;
                        return [2 /*return*/, true];
                    case 4:
                        e_2 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Initial sync failed.', e_2);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /// Pulls data from the ledger, synchronizing the currently connected wallet and
    /// balance state. This method runs until all the ledger data has arrived at and
    /// has been synchronized with the wallet.
    MantaPrivateWallet.prototype.walletSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var networkType, startTime, endTime, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!this.initialSyncIsFinished) {
                            throw new Error('Must call initalWalletSync before walletSync!');
                        }
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        this.log('Beginning sync');
                        networkType = this.wasm.Network.from_string("\"".concat(this.network, "\""));
                        startTime = performance.now();
                        return [4 /*yield*/, this.wasmWallet.sync(networkType)];
                    case 3:
                        _a.sent();
                        endTime = performance.now();
                        this.log("Initial sync finished in ".concat((endTime - startTime) / 1000, " seconds"));
                        this.walletIsBusy = false;
                        return [2 /*return*/, true];
                    case 4:
                        e_3 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Sync failed.', e_3);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /// Returns the private balance of the currently connected zkAddress for the currently
    /// connected network.
    MantaPrivateWallet.prototype.getPrivateBalance = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var balanceString, balance, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        return [4 /*yield*/, this.wasmWallet.balance(assetId.toString())];
                    case 3:
                        balanceString = _a.sent();
                        balance = new BN(balanceString);
                        this.walletIsBusy = false;
                        return [2 /*return*/, balance];
                    case 4:
                        e_4 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Failed to fetch private balance.', e_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /// Returns the metadata for an asset with a given `assetId` for the currently
    /// connected network.
    MantaPrivateWallet.prototype.getAssetMetadata = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, json, jsonObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        return [4 /*yield*/, this.api.query.assetManager.assetIdMetadata(assetId)];
                    case 1:
                        data = _a.sent();
                        json = JSON.stringify(data.toHuman());
                        jsonObj = JSON.parse(json);
                        // Dolphin is equivalent to Calamari on-chain, and only appears differently at UI level
                        // so it is necessary to set its symbol and name manually
                        if (this.network === Network.Dolphin && assetId.toString() === NATIVE_TOKEN_ASSET_ID) {
                            jsonObj.metadata.symbol = 'DOL';
                            jsonObj.metadata.name = 'Dolphin';
                        }
                        return [2 /*return*/, jsonObj];
                }
            });
        });
    };
    /// Executes a "To Private" transaction for any fungible token.
    MantaPrivateWallet.prototype.toPrivateSend = function (assetId, amount, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var signed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        return [4 /*yield*/, this.toPrivateBuild(assetId, amount, polkadotSigner, polkadotAddress)];
                    case 1:
                        signed = _a.sent();
                        // transaction rejected by signer
                        if (signed === null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendTransaction(polkadotAddress, signed)];
                    case 2:
                        _a.sent();
                        this.log('To Private transaction finished.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /// Builds and signs a "To Private" transaction for any fungible token.
    /// Note: This transaction is not published to the ledger.
    MantaPrivateWallet.prototype.toPrivateBuild = function (assetId, amount, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, signResult, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        return [4 /*yield*/, this.setPolkadotSigner(polkadotSigner, polkadotAddress)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.toPrivateBuildUnsigned(assetId, amount)];
                    case 4:
                        transaction = _a.sent();
                        return [4 /*yield*/, this.signTransaction(null, transaction, this.network)];
                    case 5:
                        signResult = _a.sent();
                        this.walletIsBusy = false;
                        return [2 /*return*/, signResult];
                    case 6:
                        e_5 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Failed to build transaction.', e_5);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /// Executes a "Private Transfer" transaction for any fungible token.
    MantaPrivateWallet.prototype.privateTransferSend = function (assetId, amount, toPrivateAddress, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var signed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        return [4 /*yield*/, this.privateTransferBuild(assetId, amount, toPrivateAddress, polkadotSigner, polkadotAddress)];
                    case 1:
                        signed = _a.sent();
                        // transaction rejected by signer
                        if (signed === null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendTransaction(polkadotAddress, signed)];
                    case 2:
                        _a.sent();
                        this.log('Private Transfer transaction finished.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /// Builds a "Private Transfer" transaction for any fungible token.
    /// Note: This transaction is not published to the ledger.
    MantaPrivateWallet.prototype.privateTransferBuild = function (assetId, amount, toPrivateAddress, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, signResult, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        return [4 /*yield*/, this.setPolkadotSigner(polkadotSigner, polkadotAddress)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.privateTransferBuildUnsigned(assetId, amount, toPrivateAddress)];
                    case 4:
                        transaction = _a.sent();
                        return [4 /*yield*/, this.signTransaction(transaction.assetMetadataJson, transaction.transaction, this.network)];
                    case 5:
                        signResult = _a.sent();
                        this.walletIsBusy = false;
                        return [2 /*return*/, signResult];
                    case 6:
                        e_6 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Failed to build transaction.', e_6);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /// Executes a "To Public" transaction for any fungible token.
    MantaPrivateWallet.prototype.toPublicSend = function (assetId, amount, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var signed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        return [4 /*yield*/, this.toPublicBuild(assetId, amount, polkadotSigner, polkadotAddress)];
                    case 1:
                        signed = _a.sent();
                        // transaction rejected by signer
                        if (signed === null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendTransaction(polkadotAddress, signed)];
                    case 2:
                        _a.sent();
                        this.log('To Public transaction finished.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /// Builds and signs a "To Public" transaction for any fungible token.
    /// Note: This transaction is not published to the ledger.
    MantaPrivateWallet.prototype.toPublicBuild = function (assetId, amount, polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, signResult, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkApiIsReady();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.waitForWallet()];
                    case 2:
                        _a.sent();
                        this.walletIsBusy = true;
                        return [4 /*yield*/, this.setPolkadotSigner(polkadotSigner, polkadotAddress)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.toPublicBuildUnsigned(assetId, amount)];
                    case 4:
                        transaction = _a.sent();
                        return [4 /*yield*/, this.signTransaction(transaction.assetMetadataJson, transaction.transaction, this.network)];
                    case 5:
                        signResult = _a.sent();
                        this.walletIsBusy = false;
                        return [2 /*return*/, signResult];
                    case 6:
                        e_7 = _a.sent();
                        this.walletIsBusy = false;
                        console.error('Failed to build transaction.', e_7);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ///
    /// Private Methods
    ///
    /// Conditionally logs the contents of `message` depending on if `loggingEnabled`
    /// is set to `true`.
    MantaPrivateWallet.prototype.log = function (message) {
        if (this.loggingEnabled) {
            console.log('[INFO]: ' + message);
        }
    };
    // WASM wallet doesn't allow you to call two methods at once, so before
    // calling methods it is necessary to wait for a pending call to finish.
    MantaPrivateWallet.prototype.waitForWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.walletIsBusy === true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /// Private helper method for internal use to initialize the Polkadot.js API with web3Extension.
    MantaPrivateWallet.initApi = function (env, network, loggingEnabled) {
        var _this = this;
        var provider = new WsProvider(MantaPrivateWallet.envUrl(env, network));
        var api = new ApiPromise({ provider: provider, types: types, rpc: rpc });
        if (loggingEnabled) {
            api.isReady.then(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, chain, nodeName, nodeVersion;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                api.rpc.system.chain(),
                                api.rpc.system.name(),
                                api.rpc.system.version()
                            ])];
                        case 1:
                            _a = _b.sent(), chain = _a[0], nodeName = _a[1], nodeVersion = _a[2];
                            console.log("[INFO]: MantaPrivateWallet api is connected to chain ".concat(chain, " using")
                                + "".concat(nodeName, " v").concat(nodeVersion));
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        return { api: api };
    };
    MantaPrivateWallet.prototype.checkApiIsReady = function () {
        if (!this.api.isReady) {
            throw new Error('Polkadot.js API is not ready.');
        }
    };
    /// Private helper method for internal use to initialize the initialize manta-wasm-wallet.
    MantaPrivateWallet.initWasmSdk = function (api, config) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var wasm, wasmSigner, wasmApiConfig, wasmApi, wasmLedger, wasmWallet;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, import('./wallet/crate/pkg/manta_wasm_wallet')];
                    case 1:
                        wasm = _c.sent();
                        wasmSigner = new wasm.Signer(SIGNER_URL);
                        wasmApiConfig = new ApiConfig(((_a = config.maxReceiversPullSize) !== null && _a !== void 0 ? _a : DEFAULT_PULL_SIZE), ((_b = config.maxSendersPullSize) !== null && _b !== void 0 ? _b : DEFAULT_PULL_SIZE), config.pullCallback, config.errorCallback, Boolean(config.loggingEnabled));
                        wasmApi = new Api(api, wasmApiConfig);
                        wasmLedger = new wasm.PolkadotJsLedger(wasmApi);
                        wasmWallet = new wasm.Wallet(wasmLedger, wasmSigner);
                        return [2 /*return*/, {
                                wasm: wasm,
                                wasmWallet: wasmWallet,
                                wasmApi: wasmApi
                            }];
                }
            });
        });
    };
    /// Sets the polkadot Signer to `polkadotSigner` and polkadot signing address to `polkadotAddress`.
    MantaPrivateWallet.prototype.setPolkadotSigner = function (polkadotSigner, polkadotAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.wasmApi.setExternalAccountSigner(polkadotAddress);
                this.api.setSigner(polkadotSigner);
                return [2 /*return*/];
            });
        });
    };
    /// Returns the corresponding blockchain connection URL from Environment
    /// and Network values.
    MantaPrivateWallet.envUrl = function (env, network) {
        var url = config.NETWORKS[network].ws_local;
        if (env == Environment.Production) {
            url = config.NETWORKS[network].ws;
        }
        return url;
    };
    /// Builds the "ToPrivate" transaction in JSON format to be signed.
    MantaPrivateWallet.prototype.toPrivateBuildUnsigned = function (assetId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var assetIdArray, txJson, transaction;
            return __generator(this, function (_a) {
                try {
                    assetIdArray = Array.from(MantaPrivateWallet.assetIdToUInt8Array(assetId));
                    txJson = "{ \"ToPrivate\": { \"id\": [".concat(assetIdArray, "], \"value\": ").concat(amount.toString(), " }}");
                    transaction = this.wasm.Transaction.from_string(txJson);
                    return [2 /*return*/, transaction];
                }
                catch (error) {
                    console.error('Unable to build "To Private" Transaction.', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /// private transfer transaction
    MantaPrivateWallet.prototype.privateTransferBuildUnsigned = function (assetId, amount, toPrivateAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var addressJson, assetIdArray, txJson, transaction, jsonObj, decimals, symbol, assetMetadataJson, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        addressJson = this.convertPrivateAddressToJson(toPrivateAddress);
                        assetIdArray = Array.from(MantaPrivateWallet.assetIdToUInt8Array(assetId));
                        txJson = "{ \"PrivateTransfer\": [{ \"id\": [".concat(assetIdArray, "], \"value\": ").concat(amount.toString(), " }, ").concat(addressJson, " ]}");
                        transaction = this.wasm.Transaction.from_string(txJson);
                        return [4 /*yield*/, this.getAssetMetadata(assetId)];
                    case 1:
                        jsonObj = _a.sent();
                        decimals = jsonObj['metadata']['decimals'];
                        symbol = jsonObj['metadata']['symbol'];
                        assetMetadataJson = "{ \"decimals\": ".concat(decimals, ", \"symbol\": \"").concat(PRIVATE_ASSET_PREFIX).concat(symbol, "\" }");
                        return [2 /*return*/, {
                                transaction: transaction,
                                assetMetadataJson: assetMetadataJson
                            }];
                    case 2:
                        e_8 = _a.sent();
                        console.error('Unable to build "Private Transfer" Transaction.', e_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /// Builds the "ToPublic" transaction in JSON format to be signed.
    MantaPrivateWallet.prototype.toPublicBuildUnsigned = function (assetId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var assetIdArray, txJson, transaction, jsonObj, decimals, symbol, assetMetadataJson, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        assetIdArray = Array.from(MantaPrivateWallet.assetIdToUInt8Array(assetId));
                        txJson = "{ \"ToPublic\": { \"id\": [".concat(assetIdArray, "], \"value\": ").concat(amount.toString(), " }}");
                        transaction = this.wasm.Transaction.from_string(txJson);
                        return [4 /*yield*/, this.getAssetMetadata(assetId)];
                    case 1:
                        jsonObj = _a.sent();
                        decimals = jsonObj['metadata']['decimals'];
                        symbol = jsonObj['metadata']['symbol'];
                        assetMetadataJson = "{ \"decimals\": ".concat(decimals, ", \"symbol\": \"").concat(PRIVATE_ASSET_PREFIX).concat(symbol, "\" }");
                        return [2 /*return*/, {
                                transaction: transaction,
                                assetMetadataJson: assetMetadataJson
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Unable to build "To Public" Transaction.', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /// Signs the a given transaction returning posts, transactions and batches.
    /// assetMetaDataJson is optional, pass in null if transaction should not contain any.
    MantaPrivateWallet.prototype.signTransaction = function (assetMetadataJson, transaction, network) {
        return __awaiter(this, void 0, void 0, function () {
            var assetMetadata, networkType, posts, transactions, i, convertedPost, transaction_1, txs, e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        assetMetadata = null;
                        if (assetMetadataJson) {
                            assetMetadata = this.wasm.AssetMetadata.from_string(assetMetadataJson);
                        }
                        networkType = this.wasm.Network.from_string("\"".concat(network, "\""));
                        return [4 /*yield*/, this.wasmWallet.sign(transaction, assetMetadata, networkType)];
                    case 1:
                        posts = _a.sent();
                        transactions = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < posts.length)) return [3 /*break*/, 5];
                        convertedPost = this.transferPost(posts[i]);
                        return [4 /*yield*/, this.mapPostToTransaction(convertedPost, this.api)];
                    case 3:
                        transaction_1 = _a.sent();
                        transactions.push(transaction_1);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.transactionsToBatches(transactions, this.api)];
                    case 6:
                        txs = _a.sent();
                        return [2 /*return*/, {
                                posts: posts,
                                transactions: transactions,
                                txs: txs
                            }];
                    case 7:
                        e_9 = _a.sent();
                        console.error('Unable to sign transaction.', e_9);
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /// This method sends a transaction to the public ledger after it has been signed
    /// by Manta Signer.
    MantaPrivateWallet.prototype.sendTransaction = function (signer, signedTransaction) {
        return __awaiter(this, void 0, void 0, function () {
            var i, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < signedTransaction.txs.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, signedTransaction.txs[i].signAndSend(signer, function (_status, _events) { })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Transaction failed', error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /// Maps a given `post` to a known transaction type, either Mint, Private Transfer or Reclaim.
    MantaPrivateWallet.prototype.mapPostToTransaction = function (post, api) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, senders, receivers, sinks, mintTx, privateTransferTx, reclaimTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = post.sources.length;
                        senders = post.sender_posts.length;
                        receivers = post.receiver_posts.length;
                        sinks = post.sinks.length;
                        if (!(sources == 1 && senders == 0 && receivers == 1 && sinks == 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, api.tx.mantaPay.toPrivate(post)];
                    case 1:
                        mintTx = _a.sent();
                        return [2 /*return*/, mintTx];
                    case 2:
                        if (!(sources == 0 && senders == 2 && receivers == 2 && sinks == 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, api.tx.mantaPay.privateTransfer(post)];
                    case 3:
                        privateTransferTx = _a.sent();
                        return [2 /*return*/, privateTransferTx];
                    case 4:
                        if (!(sources == 0 && senders == 2 && receivers == 1 && sinks == 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, api.tx.mantaPay.toPublic(post)];
                    case 5:
                        reclaimTx = _a.sent();
                        return [2 /*return*/, reclaimTx];
                    case 6: throw new Error('Invalid transaction shape; there is no extrinsic for a transaction'
                        + "with ".concat(sources, " sources, ").concat(senders, " senders, ")
                        + " ".concat(receivers, " receivers and ").concat(sinks, " sinks"));
                }
            });
        });
    };
    /// Batches transactions.
    MantaPrivateWallet.prototype.transactionsToBatches = function (transactions, api) {
        return __awaiter(this, void 0, void 0, function () {
            var MAX_BATCH, batches, i, transactionsInSameBatch, batchTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MAX_BATCH = 2;
                        batches = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < transactions.length)) return [3 /*break*/, 4];
                        transactionsInSameBatch = transactions.slice(i, i + MAX_BATCH);
                        return [4 /*yield*/, api.tx.utility.batch(transactionsInSameBatch)];
                    case 2:
                        batchTransaction = _a.sent();
                        batches.push(batchTransaction);
                        _a.label = 3;
                    case 3:
                        i += MAX_BATCH;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, batches];
                }
            });
        });
    };
    // convert receiver_posts to match runtime side
    MantaPrivateWallet.prototype.convertReceiverPost = function (x) {
        var arr1 = x.note.incoming_note.ciphertext.ciphertext.message.flatMap(function (item, index, a) {
            return item;
        });
        var tag = x.note.incoming_note.ciphertext.ciphertext.tag;
        var pk = x.note.incoming_note.ciphertext.ephemeral_public_key;
        x.note.incoming_note.tag = tag;
        x.note.incoming_note.ephemeral_public_key = pk;
        x.note.incoming_note.ciphertext = arr1;
        delete x.note.incoming_note.header;
        var lightPk = x.note.light_incoming_note.ciphertext.ephemeral_public_key;
        // ciphertext is [u8; 96] on manta-rs, but runtime side is [[u8; 32]; 3]
        var lightCipher = x.note.light_incoming_note.ciphertext.ciphertext;
        var lightCiper0 = lightCipher.slice(0, 32);
        var lightCiper1 = lightCipher.slice(32, 64);
        var lightCiper2 = lightCipher.slice(64, 96);
        x.note.light_incoming_note.ephemeral_public_key = lightPk;
        x.note.light_incoming_note.ciphertext = [lightCiper0, lightCiper1, lightCiper2];
        delete x.note.light_incoming_note.header;
        // convert asset value to [u8; 16]
        x.utxo.public_asset.value = new BN(x.utxo.public_asset.value).toArray('le', 16);
        x.full_incoming_note = x.note;
        delete x.note;
    };
    // convert sender_posts to match runtime side
    MantaPrivateWallet.prototype.convertSenderPost = function (x) {
        var pk = x.nullifier.outgoing_note.ciphertext.ephemeral_public_key;
        var cipher = x.nullifier.outgoing_note.ciphertext.ciphertext;
        var ciper0 = cipher.slice(0, 32);
        var ciper1 = cipher.slice(32, 64);
        var outgoing = {
            ephemeral_public_key: pk,
            ciphertext: [ciper0, ciper1]
        };
        x.outgoing_note = outgoing;
        var nullifier = x.nullifier.nullifier.commitment;
        x.nullifier_commitment = nullifier;
        delete x.nullifier;
    };
    /// NOTE: `post` from manta-rs sign result should match runtime side data structure type.
    MantaPrivateWallet.prototype.transferPost = function (post) {
        var _this = this;
        var json = JSON.parse(JSON.stringify(post));
        // transfer authorization_signature format
        if (json.authorization_signature != null) {
            var scala = json.authorization_signature.signature.scalar;
            var nonce = json.authorization_signature.signature.nonce_point;
            json.authorization_signature.signature = [scala, nonce];
        }
        // transfer receiver_posts to match runtime side
        json.receiver_posts.map(function (x) {
            _this.convertReceiverPost(x);
        });
        // transfer sender_posts to match runtime side
        json.sender_posts.map(function (x) {
            _this.convertSenderPost(x);
        });
        return json;
    };
    return MantaPrivateWallet;
}());
export { MantaPrivateWallet };
