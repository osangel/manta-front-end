// @ts-nocheck
import store from 'store';
import TX_STATUS from 'constants/TxStatusConstants';

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = () => {
  return store.get(PRIVATE_TRANSACTION_STORAGE_KEY, []);
}

// call addPendingPrivateTransaction when a private transaction is sent
export const addPendingPrivateTransaction = (pendingPrivateTransaction) => {
    const privateTransactionHistory = [...getPrivateTransactionHistory()];
    privateTransactionHistory.push(pendingPrivateTransaction);
    store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
}

export const removePendingPrivateTransaction = () => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  // get last transaction and check if it is pending
  const lastTransaction = privateTransactionHistory[privateTransactionHistory.length - 1];
  if (lastTransaction.status !== TX_STATUS.PENDING) {
    return;
  }
  
  privateTransactionHistory.pop();
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);

}

// call updateFinalizedPrivateTransaction when a private transaction is finalized
export const updateFinalizedPrivateTransaction = (status, extrinsicHash) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  // get last transaction and check if it is pending
  const lastTransaction = privateTransactionHistory[privateTransactionHistory.length - 1];
  if (lastTransaction.status !== TX_STATUS.PENDING) {
    return;
  }


  // update last transaction with finalized status and subscan url
  lastTransaction.status = status;
  if (extrinsicHash) {
    lastTransaction.subscanUrl = `https://dolphin.subscan.io/extrinsic/${extrinsicHash}`;
  }

  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
}

// build the private transaction object which will be paased to persistance functions
export const privateTransactionBuilder = (
    isPrivateTransfer,
    isToPrivate,
    senderAssetTargetBalance,
    status,
    subscanUrl
  ) => {
    const transactionType = isPrivateTransfer() ? 'Send' : 'Transact';
    let toPrivate;
    if (isPrivateTransfer()) {
      toPrivate = null;
    } else if(isToPrivate()) {
      toPrivate = true;
    } else {
      toPrivate = false;
    }
    const assetBaseType = senderAssetTargetBalance?.assetType.baseTicker;
    const amount =
      senderAssetTargetBalance?.valueAtomicUnits /
      10 ** senderAssetTargetBalance?.assetType.numberOfDecimals;
    const date = new Date().toUTCString();
    const transaction = {
      transactionType,
      toPrivate,
      assetBaseType,
      amount,
      date,
      status,
      subscanUrl
    };
    return transaction;
  };