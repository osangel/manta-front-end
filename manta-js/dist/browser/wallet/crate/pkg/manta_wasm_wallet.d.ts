/* tslint:disable */
/* eslint-disable */
/**
*/
export class Asset {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {Asset}
*/
  static from_string(value: string): Asset;
}
/**
*/
export class AssetId {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {AssetId}
*/
  static from_string(value: string): AssetId;
}
/**
*/
export class AssetMetadata {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {AssetMetadata}
*/
  static from_string(value: string): AssetMetadata;
}
/**
*/
export class ControlFlow {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {ControlFlow}
*/
  static from_string(value: string): ControlFlow;
}
/**
* Polkadot-JS API Ledger Connection Error
*/
export class LedgerError {
  free(): void;
}
/**
*/
export class Network {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {Network}
*/
  static from_string(value: string): Network;
}
/**
* Polkadot-JS API Ledger Connection
*/
export class PolkadotJsLedger {
  free(): void;
/**
* Builds a new [`PolkadotJsLedger`] from its JS [`Api`].
* @param {any} api
*/
  constructor(api: any);
}
/**
*/
export class ReceiverPost {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {ReceiverPost}
*/
  static from_string(value: string): ReceiverPost;
}
/**
*/
export class SenderPost {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {SenderPost}
*/
  static from_string(value: string): SenderPost;
}
/**
* Signer Client
*/
export class Signer {
  free(): void;
/**
* Builds a new signer connection with the given `server_url`.
* @param {string} server_url
*/
  constructor(server_url: string);
}
/**
* Signer Error
*/
export class SignerError {
  free(): void;
}
/**
*/
export class Transaction {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {Transaction}
*/
  static from_string(value: string): Transaction;
}
/**
*/
export class TransactionKind {
  free(): void;
/**
* Parses `Self` from a JS value.
* @param {any} value
*/
  constructor(value: any);
/**
* Parses `Self` from a [`String`].
* @param {string} value
* @returns {TransactionKind}
*/
  static from_string(value: string): TransactionKind;
}
/**
* Transfer Post
*/
export class TransferPost {
  free(): void;
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
  constructor(authorization_signature: string | undefined, asset_id: string | undefined, sources: any[], sender_posts: any[], receiver_posts: any[], sinks: any[], proof: any);
}
/**
* Wallet with Polkadot-JS API Connection
*/
export class Wallet {
  free(): void;
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
  constructor(ledger: PolkadotJsLedger, signer: Signer);
/**
* Returns the current balance associated with this `id`.
* @param {string} id
* @returns {string}
*/
  balance(id: string): string;
/**
* Returns true if `self` contains at least `asset.value` of the asset of kind `asset.id`.
* @param {Asset} asset
* @returns {boolean}
*/
  contains(asset: Asset): boolean;
/**
* Returns a shared reference to the balance state associated to `self`.
* @returns {any}
*/
  assets(): any;
/**
* Returns the [`Checkpoint`](ledger::Connection::Checkpoint) representing the current state
* of this wallet.
* @returns {any}
*/
  checkpoint(): any;
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
  restart(network: Network): Promise<any>;
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
  sync(network: Network): Promise<any>;
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
  sync_partial(network: Network): Promise<any>;
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
  check(transaction: Transaction): TransactionKind;
/**
* Signs the `transaction` using the signer connection, sending `metadata` and `network` for context. This
* method _does not_ automatically sychronize with the ledger. To do this, call the
* [`sync`](Self::sync) method separately.
* @param {Transaction} transaction
* @param {AssetMetadata | undefined} metadata
* @param {Network} network
* @returns {Promise<any>}
*/
  sign(transaction: Transaction, metadata: AssetMetadata | undefined, network: Network): Promise<any>;
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
  post(transaction: Transaction, metadata: AssetMetadata | undefined, network: Network): Promise<any>;
/**
* Returns public receiving keys according to the `request`.
* @param {Network} network
* @returns {Promise<any>}
*/
  receiving_keys(network: Network): Promise<any>;
/**
* Returns public receiving keys according to the `request`.
* @param {Network} network
* @returns {Promise<any>}
*/
  address(network: Network): Promise<any>;
}
/**
* Wallet Error
*/
export class WalletError {
  free(): void;
}
