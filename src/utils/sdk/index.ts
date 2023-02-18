import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';

export const NATIVE_TOKEN_ASSET_ID = '1';
export enum Network {
  Dolphin = 'Dolphin',
  Calamari = 'Calamari',
  Manta = 'Manta',
}

export async function getPublicBalance(api:ApiPromise, assetId: BN, address: string): Promise<BN | null> {
  try {
    if (assetId.toString() === NATIVE_TOKEN_ASSET_ID) {
      const nativeBalance: any = await api.query.system.account(address);
      return new BN(nativeBalance.data.free.toString());
    } else {
      const assetBalance: any = await api.query.assets.account(assetId, address);
      if (assetBalance.value.isEmpty) {
        return new BN(0);
      } else {
        return new BN(assetBalance.value.balance.toString());
      }
    }
  } catch (e) {
    console.log('Failed to fetch public balance.');
    console.error(e);
    return null;
  }
}

export function assetIdToUInt8Array(asset_id: BN, len = 32): Uint8Array {
  let hex = asset_id.toString(16); // to heximal format
  if (hex.length % 2) {
    hex = '0' + hex;
  }

  const u8a = new Uint8Array(len);

  let i = 0;
  let j = 0;
  while (i < len) {
    u8a[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }
  return u8a;
}