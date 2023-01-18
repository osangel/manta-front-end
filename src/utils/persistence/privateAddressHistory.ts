// @ts-nocheck
import store from 'store';

const PRIVATE_ADDRESS_STORAGE_KEY = 'privateAddressHistory';

export const getPrivateAddressHistory = () => {
  return store.get(PRIVATE_ADDRESS_STORAGE_KEY, null);
};

export const setPrivateAddressHistory = (privateAddress: string) => {
  store.set(PRIVATE_ADDRESS_STORAGE_KEY, privateAddress);
};
