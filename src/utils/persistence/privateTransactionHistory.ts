// @ts-nocheck
import store from 'store';
import { HISTORY_EVENT_STATUS } from 'types/HistoryEvent';

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = () => {
  return store.get(PRIVATE_TRANSACTION_STORAGE_KEY, []);
};

export const setPrivateTransactionHistory = (privateTransactionHistory) => {
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// add pending private transaction to the history
export const appendHistoryEvent = (historyEvent) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  privateTransactionHistory.push(historyEvent);
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// update pending transaction to finalized transaction status
export const updateHistoryEventStatus = (status, extrinsicHash) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  privateTransactionHistory.forEach((historyEvent) => {
    if (
      historyEvent.extrinsicHash === extrinsicHash &&
      historyEvent.status === HISTORY_EVENT_STATUS.PENDING
    ) {
      historyEvent.status = status;
    }
  });
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};

// remove pending history event (usually the last one) from the history
export const removePendingHistoryEvent = () => {
  const privateTransactionHistory = [...getPrivateTransactionHistory()];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  const lastTransaction =
    privateTransactionHistory[privateTransactionHistory.length - 1];
  if (lastTransaction.status !== HISTORY_EVENT_STATUS.PENDING) {
    return;
  }

  privateTransactionHistory.pop();
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};
