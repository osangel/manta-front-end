// @ts-nocheck
import store from 'store';
import TX_STATUS from 'constants/TxStatusConstants';
import PRIVATE_TX_TYPE from 'constants/PrivateTransactionType';

/**
 * Private Address History
 */

const PRIVATE_ADDRESS_STORAGE_KEY = 'privateAddressHistory';

export const getPrivateAddressHistory = () => {
  return store.get(PRIVATE_ADDRESS_STORAGE_KEY, null);
}

export const setPrivateAddressHistory = (privateAddress) => {
  store.set(PRIVATE_ADDRESS_STORAGE_KEY, privateAddress);
}


/**
 * Private Transaction History
 */

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = () => {
  return store.get(PRIVATE_TRANSACTION_STORAGE_KEY, []);
};

// add pending private transaction to the history
export const addPendingPrivateTransaction = (pendingPrivateTransaction) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  privateTransactionHistory.push(pendingPrivateTransaction);
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// update pending transaction to finalized transaction status
export const updateFinalizedPrivateTxStatus = (status, extrinsicHash) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  privateTransactionHistory.forEach((transaction) => {
    if (
      transaction.extrinsicHash === extrinsicHash &&
      transaction.status === TX_STATUS.PENDING
    ) {
      transaction.status = status;
    }
  });
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// remove pending private transaction from the history
export const removePendingPrivateTransaction = () => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  const lastTransaction =
    privateTransactionHistory[privateTransactionHistory.length - 1];
  if (lastTransaction.status !== TX_STATUS.PENDING) {
    return;
  }

  privateTransactionHistory.pop();
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// set the private transaction history 
export const setPrivateTransactionHistory = (privateTransactionHistory) => {
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// build the private transaction object accepted by addPendingPrivateTransaction
export const privateTransactionBuilder = (
  transactionType,
  assetBaseType,
  substrateAddress,
  amount,
  status,
  extrinsicHash
) => {
  const transactionMsg =
    transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER ? 'Send' : 'Transact';
  const date = new Date().toUTCString();
  const subscanUrl =
    extrinsicHash && `https://dolphin.subscan.io/extrinsic/${extrinsicHash}`;
  const transaction = {
    transactionType,
    transactionMsg,
    assetBaseType,
    substrateAddress,
    amount,
    date,
    status,
    subscanUrl,
    extrinsicHash
  };
  return transaction;
};
