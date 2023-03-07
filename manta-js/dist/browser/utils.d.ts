import { Version, Address } from './sdk.interfaces';
import { Signer } from '@polkadot/api/types';
import BN from 'bn.js';
import { ApiPromise } from '@polkadot/api';
export declare const NATIVE_TOKEN_ASSET_ID = "1";
export declare class MantaUtilities {
    static getSignerVersion(): Promise<Version | null>;
    static getPublicBalance(api: ApiPromise, assetId: BN, address: Address): Promise<BN | null>;
    static publicTransfer(api: ApiPromise, assetId: BN, amount: BN, destinationAddress: Address, senderAddress: Address, polkadotSigner: Signer): Promise<void>;
}
