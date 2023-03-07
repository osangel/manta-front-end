"use strict";
// Polkadot-JS Ledger Integration
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Senders = exports.$Receivers = exports.FAILURE = exports.SUCCESS = exports.ApiConfig = void 0;
// Polkadot-JS Ledger API
var util_crypto_1 = require("@polkadot/util-crypto");
var $ = __importStar(require("scale-codec"));
var util_1 = require("@polkadot/util");
var ApiConfig = /** @class */ (function () {
    function ApiConfig(maxReceiversPullSize, maxSendersPullSize, pullCallback, errorCallback, loggingEnabled) {
        if (pullCallback === void 0) { pullCallback = null; }
        if (errorCallback === void 0) { errorCallback = null; }
        if (loggingEnabled === void 0) { loggingEnabled = false; }
        this.loggingEnabled = loggingEnabled;
        this.maxReceiversPullSize = maxReceiversPullSize;
        this.maxSendersPullSize = maxSendersPullSize;
        this.pullCallback = pullCallback;
        this.errorCallback = errorCallback;
    }
    return ApiConfig;
}());
exports.ApiConfig = ApiConfig;
var Api = /** @class */ (function () {
    // Constructs an API from a config
    function Api(api, config) {
        var _this = this;
        // Sets the transaction result handler to `txResHandler`.
        this.setTxResHandler = function (txResHandler) {
            _this.txResHandler = txResHandler;
        };
        // Sets the externalAccountSigner to `signer`.
        this.setExternalAccountSigner = function (signer) {
            _this.externalAccountSigner = signer;
        };
        this.loggingEnabled = config.loggingEnabled;
        this.config = config;
        this.api = api;
        this.externalAccountSigner = null;
        this.maxReceiversPullSize = this.config.maxReceiversPullSize;
        this.maxSendersPullSize = this.config.maxSendersPullSize;
        this.txResHandler = null;
        this.pullCallback = this.config.pullCallback;
        this.errorCallback = this.config.errorCallback;
    }
    Api.prototype._log = function (message) {
        if (this.loggingEnabled) {
            console.log('[INFO]: ' + message);
        }
    };
    // Converts an `outgoing note` into a JSON object.
    Api.prototype._outgoing_note_to_json = function (note) {
        // [[u8; 32], 2]
        var ciphertext = note.ciphertext;
        var cipher0 = Array.from(ciphertext[0]);
        var cipher1 = Array.from(ciphertext[1]);
        return {
            ephemeral_public_key: Array.from((0, util_1.u8aToU8a)(note.ephemeral_public_key)),
            ciphertext: [cipher0, cipher1]
        };
    };
    // Converts an `light incoming note` into a JSON object.
    Api.prototype._light_incoming_note_to_json = function (note) {
        // [[u8; 32], 3]
        var ciphertext = note.ciphertext;
        var cipher0 = Array.from(ciphertext[0]);
        var cipher1 = Array.from(ciphertext[1]);
        var cipher2 = Array.from(ciphertext[2]);
        return {
            ephemeral_public_key: Array.from((0, util_1.u8aToU8a)(note.ephemeral_public_key)),
            ciphertext: [cipher0, cipher1, cipher2]
        };
    };
    // Converts an `incoming note` into a JSON object.
    Api.prototype._incoming_note_to_json = function (note) {
        // [[u8; 32]; 3]
        var ciphertext = note.ciphertext;
        var cipher0 = Array.from(ciphertext[0]);
        var cipher1 = Array.from(ciphertext[1]);
        var cipher2 = Array.from(ciphertext[2]);
        return {
            ephemeral_public_key: Array.from((0, util_1.u8aToU8a)(note.ephemeral_public_key)),
            tag: Array.from((0, util_1.u8aToU8a)(note.tag)),
            ciphertext: [cipher0, cipher1, cipher2]
        };
    };
    // Converts an `full incoming note` into a JSON object.
    Api.prototype._full_incoming_note_to_jons = function (note) {
        return {
            address_partition: note.address_partition,
            incoming_note: this._incoming_note_to_json(note.incoming_note),
            light_incoming_note: this._light_incoming_note_to_json(note.light_incoming_note),
        };
    };
    // Converts an `utxo` into a JSON object.
    Api.prototype._utxo_to_json = function (utxo) {
        var asset_id = Array.from((0, util_1.u8aToU8a)(utxo.public_asset.id));
        var asset_value = Array.from((0, util_1.u8aToU8a)(utxo.public_asset.value));
        return {
            is_transparent: utxo.is_transparent,
            public_asset: {
                id: asset_id,
                value: asset_value,
            },
            commitment: Array.from((0, util_1.u8aToU8a)(utxo.commitment))
        };
    };
    // Pulls data from the ledger from the `checkpoint` or later, returning the new checkpoint.
    Api.prototype.pull = function (checkpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var result, decodedReceivers, receivers, decodedSenders, senders, pull_result, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.api.isReady];
                    case 1:
                        _a.sent();
                        this._log('checkpoint ' + JSON.stringify(checkpoint));
                        return [4 /*yield*/, this.api.rpc.mantaPay.dense_pull_ledger_diff(checkpoint, this.maxReceiversPullSize, this.maxSendersPullSize)];
                    case 2:
                        result = _a.sent();
                        this._log('pull result ' + JSON.stringify(result));
                        decodedReceivers = exports.$Receivers.decode((0, util_crypto_1.base64Decode)(result.receivers.toString()));
                        $.assert(exports.$Receivers, decodedReceivers);
                        receivers = decodedReceivers.map(function (receiver) {
                            return [
                                _this._utxo_to_json(receiver[0]),
                                _this._full_incoming_note_to_jons(receiver[1])
                            ];
                        });
                        decodedSenders = exports.$Senders.decode((0, util_crypto_1.base64Decode)(result.senders.toString()));
                        $.assert(exports.$Senders, decodedSenders);
                        senders = decodedSenders.map(function (sender) {
                            return [
                                Array.from((0, util_1.u8aToU8a)(sender[0])),
                                _this._outgoing_note_to_json(sender[1]),
                            ];
                        });
                        if (this.pullCallback) {
                            this.pullCallback(receivers, senders, checkpoint.sender_index, result.sender_recievers_total.toNumber());
                        }
                        pull_result = {
                            should_continue: result.should_continue,
                            receivers: receivers,
                            senders: senders,
                        };
                        this._log('pull response: ' + JSON.stringify(pull_result));
                        return [2 /*return*/, pull_result];
                    case 3:
                        err_1 = _a.sent();
                        if (this.errorCallback) {
                            this.errorCallback();
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Maps a transfer post object to its corresponding MantaPay extrinsic.
    Api.prototype._map_post_to_transaction = function (post) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, senders, receivers, sinks, mint_tx, private_transfer_tx, reclaim_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = post.sources.length;
                        senders = post.sender_posts.length;
                        receivers = post.receiver_posts.length;
                        sinks = post.sinks.length;
                        if (!(sources == 1 && senders == 0 && receivers == 1 && sinks == 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.tx.mantaPay.toPrivate(post)];
                    case 1:
                        mint_tx = _a.sent();
                        return [2 /*return*/, mint_tx];
                    case 2:
                        if (!(sources == 0 && senders == 2 && receivers == 2 && sinks == 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.api.tx.mantaPay.privateTransfer(post)];
                    case 3:
                        private_transfer_tx = _a.sent();
                        return [2 /*return*/, private_transfer_tx];
                    case 4:
                        if (!(sources == 0 && senders == 2 && receivers == 1 && sinks == 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.api.tx.mantaPay.toPublic(post)];
                    case 5:
                        reclaim_tx = _a.sent();
                        return [2 /*return*/, reclaim_tx];
                    case 6: throw new Error('Invalid transaction shape; there is no extrinsic for a transaction' +
                        "with ".concat(sources, " sources, ").concat(senders, " senders, ") +
                        " ".concat(receivers, " receivers and ").concat(sinks, " sinks"));
                }
            });
        });
    };
    // Sends a set of transfer posts (i.e. "transactions") to the ledger.
    Api.prototype.push = function (posts) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, _i, posts_1, post, transaction, batchTx, signResult, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.isReady];
                    case 1:
                        _a.sent();
                        transactions = [];
                        _i = 0, posts_1 = posts;
                        _a.label = 2;
                    case 2:
                        if (!(_i < posts_1.length)) return [3 /*break*/, 5];
                        post = posts_1[_i];
                        return [4 /*yield*/, this._map_post_to_transaction(post)];
                    case 3:
                        transaction = _a.sent();
                        transactions.push(transaction);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _a.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, this.api.tx.utility.batch(transactions)];
                    case 6:
                        batchTx = _a.sent();
                        this._log('Batch Transaction: ' + batchTx);
                        return [4 /*yield*/, batchTx.signAndSend(this.externalAccountSigner, this.txResHandler)];
                    case 7:
                        signResult = _a.sent();
                        this._log('Result: ' + signResult);
                        return [2 /*return*/, { Ok: exports.SUCCESS }];
                    case 8:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [2 /*return*/, { Ok: exports.FAILURE }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return Api;
}());
exports.default = Api;
exports.SUCCESS = 'success';
exports.FAILURE = 'failure';
var $Asset = $.object($.field('id', $.sizedUint8Array(32)), $.field('value', $.sizedUint8Array(16)));
var $Utxo = $.object($.field('is_transparent', $.bool), $.field('public_asset', $Asset), $.field('commitment', $.sizedUint8Array(32)));
var $IncomingNote = $.object($.field('ephemeral_public_key', $.sizedUint8Array(32)), $.field('tag', $.sizedUint8Array(32)), $.field('ciphertext', $.sizedArray($.sizedUint8Array(32), 3)));
var $LightIncomingNote = $.object($.field('ephemeral_public_key', $.sizedUint8Array(32)), $.field('ciphertext', $.sizedArray($.sizedUint8Array(32), 3)));
var $FullIncomingNote = $.object($.field('address_partition', $.u8), $.field('incoming_note', $IncomingNote), $.field('light_incoming_note', $LightIncomingNote));
var $OutgoingNote = $.object($.field('ephemeral_public_key', $.sizedUint8Array(32)), $.field('ciphertext', $.sizedArray($.sizedUint8Array(32), 2)));
exports.$Receivers = $.array($.tuple($Utxo, $FullIncomingNote));
exports.$Senders = $.array($.tuple($.sizedUint8Array(32), $OutgoingNote));
