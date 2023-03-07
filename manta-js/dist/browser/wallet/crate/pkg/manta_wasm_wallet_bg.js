let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_28(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h05cb8462c9f0ee2f(arg0, arg1, addHeapObject(arg2));
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_107(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h2737c40f1eb106a8(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export class Asset {

    static __wrap(ptr) {
        const obj = Object.create(Asset.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_asset_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.asset_new(addHeapObject(value));
        return Asset.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {Asset}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.asset_from_string(ptr0, len0);
        return Asset.__wrap(ret);
    }
}
/**
*/
export class AssetId {

    static __wrap(ptr) {
        const obj = Object.create(AssetId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_assetid_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.assetid_new(addHeapObject(value));
        return AssetId.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {AssetId}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.assetid_from_string(ptr0, len0);
        return AssetId.__wrap(ret);
    }
}
/**
*/
export class AssetMetadata {

    static __wrap(ptr) {
        const obj = Object.create(AssetMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_assetmetadata_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.assetmetadata_new(addHeapObject(value));
        return AssetMetadata.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {AssetMetadata}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.assetmetadata_from_string(ptr0, len0);
        return AssetMetadata.__wrap(ret);
    }
}
/**
*/
export class ControlFlow {

    static __wrap(ptr) {
        const obj = Object.create(ControlFlow.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_controlflow_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.controlflow_new(addHeapObject(value));
        return ControlFlow.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {ControlFlow}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.controlflow_from_string(ptr0, len0);
        return ControlFlow.__wrap(ret);
    }
}
/**
* Polkadot-JS API Ledger Connection Error
*/
export class LedgerError {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ledgererror_free(ptr);
    }
}
/**
*/
export class Network {

    static __wrap(ptr) {
        const obj = Object.create(Network.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_network_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.network_new(addHeapObject(value));
        return Network.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {Network}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.network_from_string(ptr0, len0);
        return Network.__wrap(ret);
    }
}
/**
* Polkadot-JS API Ledger Connection
*/
export class PolkadotJsLedger {

    static __wrap(ptr) {
        const obj = Object.create(PolkadotJsLedger.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_polkadotjsledger_free(ptr);
    }
    /**
    * Builds a new [`PolkadotJsLedger`] from its JS [`Api`].
    * @param {any} api
    */
    constructor(api) {
        const ret = wasm.polkadotjsledger_new(addHeapObject(api));
        return PolkadotJsLedger.__wrap(ret);
    }
}
/**
*/
export class ReceiverPost {

    static __wrap(ptr) {
        const obj = Object.create(ReceiverPost.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_receiverpost_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.receiverpost_new(addHeapObject(value));
        return ReceiverPost.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {ReceiverPost}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.receiverpost_from_string(ptr0, len0);
        return ReceiverPost.__wrap(ret);
    }
}
/**
*/
export class SenderPost {

    static __wrap(ptr) {
        const obj = Object.create(SenderPost.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_senderpost_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.senderpost_new(addHeapObject(value));
        return SenderPost.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {SenderPost}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.senderpost_from_string(ptr0, len0);
        return SenderPost.__wrap(ret);
    }
}
/**
* Signer Client
*/
export class Signer {

    static __wrap(ptr) {
        const obj = Object.create(Signer.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signer_free(ptr);
    }
    /**
    * Builds a new signer connection with the given `server_url`.
    * @param {string} server_url
    */
    constructor(server_url) {
        const ptr0 = passStringToWasm0(server_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signer_new(ptr0, len0);
        return ret === 0 ? undefined : Signer.__wrap(ret);
    }
}
/**
* Signer Error
*/
export class SignerError {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signererror_free(ptr);
    }
}
/**
*/
export class Transaction {

    static __wrap(ptr) {
        const obj = Object.create(Transaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.transaction_new(addHeapObject(value));
        return Transaction.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {Transaction}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.transaction_from_string(ptr0, len0);
        return Transaction.__wrap(ret);
    }
}
/**
*/
export class TransactionKind {

    static __wrap(ptr) {
        const obj = Object.create(TransactionKind.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionkind_free(ptr);
    }
    /**
    * Parses `Self` from a JS value.
    * @param {any} value
    */
    constructor(value) {
        const ret = wasm.transactionkind_new(addHeapObject(value));
        return TransactionKind.__wrap(ret);
    }
    /**
    * Parses `Self` from a [`String`].
    * @param {string} value
    * @returns {TransactionKind}
    */
    static from_string(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.transactionkind_from_string(ptr0, len0);
        return TransactionKind.__wrap(ret);
    }
}
/**
* Transfer Post
*/
export class TransferPost {

    static __wrap(ptr) {
        const obj = Object.create(TransferPost.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transferpost_free(ptr);
    }
    /**
    * Builds a new [`TransferPost`].
    * @param {string | undefined} authorization_signature
    * @param {string | undefined} asset_id
    * @param {any[]} sources
    * @param {any[]} sender_posts
    * @param {any[]} receiver_posts
    * @param {any[]} sinks
    * @param {any} proof
    */
    constructor(authorization_signature, asset_id, sources, sender_posts, receiver_posts, sinks, proof) {
        var ptr0 = isLikeNone(asset_id) ? 0 : passStringToWasm0(asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(sources, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(sender_posts, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayJsValueToWasm0(receiver_posts, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArrayJsValueToWasm0(sinks, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.transferpost_new(isLikeNone(authorization_signature) ? 0 : addHeapObject(authorization_signature), ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, addHeapObject(proof));
        return TransferPost.__wrap(ret);
    }
}
/**
* Wallet with Polkadot-JS API Connection
*/
export class Wallet {

    static __wrap(ptr) {
        const obj = Object.create(Wallet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallet_free(ptr);
    }
    /**
    * Starts a new [`Wallet`] from existing `signer` and `ledger` connections.
    *
    * # Setting Up the Wallet
    *
    * Creating a [`Wallet`] using this method should be followed with a call to [`sync`] or
    * [`recover`] to retrieve the current checkpoint and balance for this [`Wallet`]. If the
    * backing `signer` is known to be already initialized, a call to [`sync`] is enough,
    * otherwise, a call to [`recover`] is necessary to retrieve the full balance state.
    *
    * [`sync`]: Self::sync
    * [`recover`]: Self::recover
    * @param {PolkadotJsLedger} ledger
    * @param {Signer} signer
    */
    constructor(ledger, signer) {
        _assertClass(ledger, PolkadotJsLedger);
        var ptr0 = ledger.__destroy_into_raw();
        _assertClass(signer, Signer);
        var ptr1 = signer.__destroy_into_raw();
        const ret = wasm.wallet_new(ptr0, ptr1);
        return Wallet.__wrap(ret);
    }
    /**
    * Returns the current balance associated with this `id`.
    * @param {string} id
    * @returns {string}
    */
    balance(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wallet_balance(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns true if `self` contains at least `asset.value` of the asset of kind `asset.id`.
    * @param {Asset} asset
    * @returns {boolean}
    */
    contains(asset) {
        _assertClass(asset, Asset);
        var ptr0 = asset.__destroy_into_raw();
        const ret = wasm.wallet_contains(this.ptr, ptr0);
        return ret !== 0;
    }
    /**
    * Returns a shared reference to the balance state associated to `self`.
    * @returns {any}
    */
    assets() {
        const ret = wasm.wallet_assets(this.ptr);
        return takeObject(ret);
    }
    /**
    * Returns the [`Checkpoint`](ledger::Connection::Checkpoint) representing the current state
    * of this wallet.
    * @returns {any}
    */
    checkpoint() {
        const ret = wasm.wallet_checkpoint(this.ptr);
        return takeObject(ret);
    }
    /**
    * Performs full wallet recovery.
    *
    * # Failure Conditions
    *
    * This method returns an element of type [`Error`] on failure, which can result from any
    * number of synchronization issues between the wallet, the ledger, and the signer. See the
    * [`InconsistencyError`] type for more information on the kinds of errors that can occur and
    * how to resolve them.
    *
    * [`Error`]: wallet::Error
    * [`InconsistencyError`]: wallet::InconsistencyError
    * @param {Network} network
    * @returns {Promise<any>}
    */
    restart(network) {
        _assertClass(network, Network);
        var ptr0 = network.__destroy_into_raw();
        const ret = wasm.wallet_restart(this.ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * Pulls data from the ledger, synchronizing the wallet and balance state. This method loops
    * continuously calling [`sync_partial`](Self::sync_partial) until all the ledger data has
    * arrived at and has been synchronized with the wallet.
    *
    * # Failure Conditions
    *
    * This method returns an element of type [`Error`] on failure, which can result from any
    * number of synchronization issues between the wallet, the ledger, and the signer. See the
    * [`InconsistencyError`] type for more information on the kinds of errors that can occur and
    * how to resolve them.
    *
    * [`Error`]: wallet::Error
    * [`InconsistencyError`]: wallet::InconsistencyError
    * @param {Network} network
    * @returns {Promise<any>}
    */
    sync(network) {
        _assertClass(network, Network);
        var ptr0 = network.__destroy_into_raw();
        const ret = wasm.wallet_sync(this.ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * Pulls data from the ledger, synchronizing the wallet and balance state. This method returns
    * a [`ControlFlow`] for matching against to determine if the wallet requires more
    * synchronization.
    *
    * # Failure Conditions
    *
    * This method returns an element of type [`Error`] on failure, which can result from any
    * number of synchronization issues between the wallet, the ledger, and the signer. See the
    * [`InconsistencyError`] type for more information on the kinds of errors that can occur and
    * how to resolve them.
    *
    * [`Error`]: wallet::Error
    * [`InconsistencyError`]: wallet::InconsistencyError
    * @param {Network} network
    * @returns {Promise<any>}
    */
    sync_partial(network) {
        _assertClass(network, Network);
        var ptr0 = network.__destroy_into_raw();
        const ret = wasm.wallet_sync_partial(this.ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * Checks if `transaction` can be executed on the balance state of `self`, returning the
    * kind of update that should be performed on the balance state if the transaction is
    * successfully posted to the ledger.
    *
    * # Safety
    *
    * This method is already called by [`post`](Self::post), but can be used by custom
    * implementations to perform checks elsewhere.
    * @param {Transaction} transaction
    * @returns {TransactionKind}
    */
    check(transaction) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(transaction, Transaction);
            wasm.wallet_check(retptr, this.ptr, transaction.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return TransactionKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Signs the `transaction` using the signer connection, sending `metadata` and `network` for context. This
    * method _does not_ automatically sychronize with the ledger. To do this, call the
    * [`sync`](Self::sync) method separately.
    * @param {Transaction} transaction
    * @param {AssetMetadata | undefined} metadata
    * @param {Network} network
    * @returns {Promise<any>}
    */
    sign(transaction, metadata, network) {
        _assertClass(transaction, Transaction);
        var ptr0 = transaction.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(metadata)) {
            _assertClass(metadata, AssetMetadata);
            ptr1 = metadata.__destroy_into_raw();
        }
        _assertClass(network, Network);
        var ptr2 = network.__destroy_into_raw();
        const ret = wasm.wallet_sign(this.ptr, ptr0, ptr1, ptr2);
        return takeObject(ret);
    }
    /**
    * Posts a transaction to the ledger, returning a success [`Response`] if the `transaction`
    * was successfully posted to the ledger. This method automatically synchronizes with the
    * ledger before posting, _but not after_. To amortize the cost of future calls to [`post`],
    * the [`sync`] method can be used to synchronize with the ledger.
    *
    * # Failure Conditions
    *
    * This method returns a [`Response`] when there were no errors in producing transfer data and
    * sending and receiving from the ledger, but instead the ledger just did not accept the
    * transaction as is. This could be caused by an external update to the ledger while the signer
    * was building the transaction that caused the wallet and the ledger to get out of sync. In
    * this case, [`post`] can safely be called again, to retry the transaction.
    *
    * This method returns an error in any other case. The internal state of the wallet is kept
    * consistent between calls and recoverable errors are returned for the caller to handle.
    *
    * [`Response`]: ledger::Write::Response
    * [`post`]: Self::post
    * [`sync`]: Self::sync
    * @param {Transaction} transaction
    * @param {AssetMetadata | undefined} metadata
    * @param {Network} network
    * @returns {Promise<any>}
    */
    post(transaction, metadata, network) {
        _assertClass(transaction, Transaction);
        var ptr0 = transaction.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(metadata)) {
            _assertClass(metadata, AssetMetadata);
            ptr1 = metadata.__destroy_into_raw();
        }
        _assertClass(network, Network);
        var ptr2 = network.__destroy_into_raw();
        const ret = wasm.wallet_post(this.ptr, ptr0, ptr1, ptr2);
        return takeObject(ret);
    }
    /**
    * Returns public receiving keys according to the `request`.
    * @param {Network} network
    * @returns {Promise<any>}
    */
    receiving_keys(network) {
        _assertClass(network, Network);
        var ptr0 = network.__destroy_into_raw();
        const ret = wasm.wallet_receiving_keys(this.ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * Returns public receiving keys according to the `request`.
    * @param {Network} network
    * @returns {Promise<any>}
    */
    address(network) {
        _assertClass(network, Network);
        var ptr0 = network.__destroy_into_raw();
        const ret = wasm.wallet_address(this.ptr, ptr0);
        return takeObject(ret);
    }
}
/**
* Wallet Error
*/
export class WalletError {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_walleterror_free(ptr);
    }
}

export function __wbindgen_json_parse(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_asset_new(arg0) {
    const ret = Asset.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pull_dbd9dd698c1a64a2(arg0, arg1) {
    const ret = getObject(arg0).pull(takeObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_push_1da70c715d0a0168(arg0, arg1, arg2) {
    var v0 = getArrayJsValueFromWasm0(arg1, arg2).slice();
    wasm.__wbindgen_free(arg1, arg2 * 4);
    const ret = getObject(arg0).push(v0);
    return addHeapObject(ret);
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_fetch_3a1be51760e1f8eb(arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_fetch_661ffba2a4f2519c(arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_instanceof_Response_fb3a4df648c1859b(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_url_8ec2534cdfacb103(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_status_d483a4ac847f380a(arg0) {
    const ret = getObject(arg0).status;
    return ret;
};

export function __wbg_headers_6093927dc359903e(arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

export function __wbg_arrayBuffer_cb886e06a9e36e4d() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newwithstrandinit_c45f0dc6da26fd03() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_f1c3a9c2533a55b8() { return handleError(function () {
    const ret = new Headers();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_append_1be1d651f9ecf2eb() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg_newnoargs_2b8b6bd7753c76ba(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_next_b7d530c04fd8b217(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_next_88560ec06a094dea() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_1ebec03bbd919843(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_value_6ac8da5cc5b3efda(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_iterator_55f114446221aa5a() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_get_baf4855f9a986186() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_95d1ea488d03e4e8() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_f9876326328f45ed() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_self_e7c1f827057f6584() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_a09ec664e14b1b81() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_87cbb8506fecf3a9() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_c85a9259e621f3db() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_call_9495de66fdbe016b() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_9d3a9ce4282a18a8(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_107(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_fd40f858d9db1a04(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_ec5db6d509eb475f(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_f753623316e2873a(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_buffer_cf65c07de34b9a08(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_537b7341ce90bb31(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_17499e8aa4003ebd(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_27a2afe8ab42b09f(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_has_3feea89d34bd7ad5() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_set_6aa458a4ebdb65cb() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_stringify_029a979dfb73aa17() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper930(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 275, __wbg_adapter_28);
    return addHeapObject(ret);
};

