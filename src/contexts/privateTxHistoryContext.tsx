//@ts-nocheck
import React, { useEffect, createContext, useContext } from 'react';
import * as axios from 'axios';
import { usePrivateWallet } from './privateWalletContext';
import {
  appendHistoryEvent,
  setPrivateTransactionHistory,
  getPrivateTransactionHistory,
  updateHistoryEventStatus
} from 'utils/persistence/privateTransactionHistory';
import {
  getPrivateAddressHistory,
  setPrivateAddressHistory
} from 'utils/persistence/privateAddressHistory';
import HistoryEvent, {
  HISTORY_EVENT_STATUS,
  PRIVATE_TX_TYPE,
  TransactionMsgAction
} from 'types/HistoryEvent';

import PropTypes from 'prop-types';
import { useTxStatus } from './txStatusContext';
import { useConfig } from './configContext';
import { useSend } from 'pages/SendPage/SendContext';

const PrivateTxHistoryContext = createContext();

export const PrivateTxHistoryContextProvider = (props) => {
  const config = useConfig();
  const { txStatus } = useTxStatus();
  const { privateAddress } = usePrivateWallet();
  const {
    isToPublic,
    isToPrivate,
    isPrivateTransfer,
    senderAssetTargetBalance
  } = useSend();

  const buildHistoryEvent = () => {
    const date = new Date().toUTCString();
    const amount = senderAssetTargetBalance.toString();
    const assetBaseType = senderAssetTargetBalance.assetType.baseTicker;
    const subscanUrl = `${config.SUBSCAN_URL}/extrinsic/${txStatus.extrinsic}`;
    let transactionType;
    if (isPrivateTransfer()) {
      transactionType = PRIVATE_TX_TYPE.PRIVATE_TRANSFER;
    } else if (isToPrivate()) {
      transactionType = PRIVATE_TX_TYPE.TO_PRIVATE;
    } else if (isToPublic()) {
      transactionType = PRIVATE_TX_TYPE.TO_PUBLIC;
    }
    const transactionMsg =
      transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER
        ? TransactionMsgAction.Transact
        : TransactionMsgAction.Send;

    const historyEvent = new HistoryEvent(
      transactionType,
      transactionMsg,
      assetBaseType,
      amount,
      date,
      HISTORY_EVENT_STATUS.PENDING,
      txStatus.extrinsic,
      subscanUrl
    );
    appendHistoryEvent(historyEvent);
  };

  useEffect(() => {
    if (
      (isPrivateTransfer() || isToPrivate() || isToPublic()) &&
      txStatus?.isProcessing() &&
      txStatus?.extrinsic
    ) {
      buildHistoryEvent();
    }
  }, [txStatus]);

  /**
   * Update history event status When page loads
   */

  const getPendingPrivateTransaction = () => {
    return getPrivateTransactionHistory().filter(
      (tx) => tx.status === HISTORY_EVENT_STATUS.PENDING
    );
  };

  const syncPendingPrivateTransactionHistory = async () => {
    const pendingPrivateTransactions = getPendingPrivateTransaction();

    await pendingPrivateTransactions.forEach(async (tx) => {
      if (tx.extrinsicHash) {
        const response = await axios.post(
          'https://dolphin.api.subscan.io/api/scan/extrinsic',
          {
            hash: tx.extrinsicHash
          }
        );
        const data = response.data.data;
        if (data !== null) {
          const status = data.success
            ? HISTORY_EVENT_STATUS.SUCCESS
            : HISTORY_EVENT_STATUS.FAILURE;
          updateHistoryEventStatus(status, tx.extrinsicHash);
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (getPendingPrivateTransaction().length !== 0 && !txStatus?.isProcessing()) {
        syncPendingPrivateTransactionHistory();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Reset Private Transaction History When private address change
   */

  useEffect(() => {
    const resetPrivateTransactionHistory = () => {
      if (privateAddress && privateAddress !== getPrivateAddressHistory()) {
        setPrivateAddressHistory(privateAddress);
        if (getPrivateTransactionHistory().length > 0) {
          setPrivateTransactionHistory([]);
        }
      }
    };
    resetPrivateTransactionHistory();
  }, [privateAddress]);

  const value = {
    buildHistoryEvent: buildHistoryEvent
  };

  return (
    <PrivateTxHistoryContext.Provider value={value}>
      {props.children}
    </PrivateTxHistoryContext.Provider>
  );
};

PrivateTxHistoryContextProvider.propTypes = {
  children: PropTypes.any
};

export const usePrivateTxHistory = () => ({
  ...useContext(PrivateTxHistoryContext)
});
