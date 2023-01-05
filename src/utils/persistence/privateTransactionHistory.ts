// @ts-nocheck
import store from 'store';

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = () => {
  return store.get(PRIVATE_TRANSACTION_STORAGE_KEY, []);
}

// call addPendingPrivateTransaction when a private transaction is sent
export const addPendingPrivateTransaction = (pendingPrivateTransaction) => {
    const privateTransactionHistory = getPrivateTransactionHistory();
    const newPrivateTransactionHistory = privateTransactionHistory.append(pendingPrivateTransaction);
    store.set(PRIVATE_TRANSACTION_STORAGE_KEY, newPrivateTransactionHistory);
}

// call updateFinalizedPrivateTransaction when a private transaction is finalized
export const updateFinalizedPrivateTransaction = (finalizedPrivateTransaction) => {
  const privateTransactionHistory = getPrivateTransactionHistory();
  const noPendingPrivateTransactionHistory = privateTransactionHistory.pop();
  const newPrivateTransactionHistory = noPendingPrivateTransactionHistory.append(finalizedPrivateTransaction);
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, newPrivateTransactionHistory);
}

// used this function to build the private transaction object which will be paased to persistance functions
export const privateTransactionBuilder = (
    isPrivateTransfer,
    senderAssetTargetBalance,
    status,
    subscanUrl
  ) => {
    const transactType = isPrivateTransfer() ? 'Send' : 'Transact';
    const assetBaseType = senderAssetTargetBalance?.assetType.baseAssetType;
    const amount =
      senderAssetTargetBalance?.valueAtomicUnits /
      10 ** senderAssetTargetBalance?.assetType.numberOfDecimals;
    const date = new Date().toUTCString();
    const transaction = {
      transactType,
      assetBaseType,
      amount,
      date,
      status,
      subscanUrl
    };
    return transaction;
  };