import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { Wallet } from './wallet/crate/pkg/manta_wasm_wallet';
import { Signer } from '@polkadot/api/types';
import { Address, AssetId, IMantaPrivateWallet, SignedTransaction, PrivateWalletConfig } from './sdk.interfaces';
export declare enum Environment {
    Development = "DEV",
    Production = "PROD"
}
export declare enum Network {
    Dolphin = "Dolphin",
    Calamari = "Calamari",
    Manta = "Manta"
}
export declare class MantaPrivateWallet implements IMantaPrivateWallet {
    api: ApiPromise;
    wasm: any;
    wasmWallet: Wallet;
    network: Network;
    wasmApi: any;
    walletIsBusy: boolean;
    initialSyncIsFinished: boolean;
    loggingEnabled: boolean;
    constructor(api: ApiPromise, wasm: any, wasmWallet: Wallet, network: Network, wasmApi: any, loggingEnabled: boolean);
    static init(config: PrivateWalletConfig): Promise<MantaPrivateWallet>;
    convertPrivateAddressToJson(address: string): any;
    static assetIdToUInt8Array(asset_id: BN, len?: number): AssetId;
    getNetworks(): any;
    getZkAddress(): Promise<Address>;
    initalWalletSync(): Promise<boolean>;
    walletSync(): Promise<boolean>;
    getPrivateBalance(assetId: BN): Promise<BN | null>;
    getAssetMetadata(assetId: BN): Promise<any>;
    toPrivateSend(assetId: BN, amount: BN, polkadotSigner: Signer, polkadotAddress: Address): Promise<void>;
    toPrivateBuild(assetId: BN, amount: BN, polkadotSigner: Signer, polkadotAddress: Address): Promise<SignedTransaction | null>;
    privateTransferSend(assetId: BN, amount: BN, toPrivateAddress: Address, polkadotSigner: Signer, polkadotAddress: Address): Promise<void>;
    privateTransferBuild(assetId: BN, amount: BN, toPrivateAddress: Address, polkadotSigner: Signer, polkadotAddress: Address): Promise<SignedTransaction | null>;
    toPublicSend(assetId: BN, amount: BN, polkadotSigner: Signer, polkadotAddress: Address): Promise<void>;
    toPublicBuild(assetId: BN, amount: BN, polkadotSigner: Signer, polkadotAddress: Address): Promise<SignedTransaction | null>;
    private log;
    private waitForWallet;
    private static initApi;
    private checkApiIsReady;
    private static initWasmSdk;
    private setPolkadotSigner;
    private static envUrl;
    private toPrivateBuildUnsigned;
    private privateTransferBuildUnsigned;
    private toPublicBuildUnsigned;
    private signTransaction;
    private sendTransaction;
    private mapPostToTransaction;
    private transactionsToBatches;
    private convertReceiverPost;
    private convertSenderPost;
    private transferPost;
}
