//@ts-nocheck
import React, { useEffect, createContext, useContext } from 'react';
import * as axios from 'axios';
import { usePrivateWallet } from './privateWalletContext';
import {
  appendHistoryEvent,
  removePendingHistoryEvent,
  setPrivateTransactionHistory,
  getPrivateTransactionHistory,
  updateHistoryEventStatus
} from 'utils/persistence/privateTransactionHistory';
import {
  getLastSeenPrivateAddress,
  setLastSeenPrivateAddress
} from 'utils/persistence/privateAddressHistory';
import HistoryEvent, {
  HISTORY_EVENT_STATUS,
  PRIVATE_TX_TYPE
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

  useEffect(() => {
    if (
      (isPrivateTransfer() || isToPrivate() || isToPublic()) &&
      txStatus?.isProcessing() &&
      txStatus?.extrinsic
    ) {
      let transactionType;
      if (isPrivateTransfer()) {
        transactionType = PRIVATE_TX_TYPE.PRIVATE_TRANSFER;
      } else if (isToPrivate()) {
        transactionType = PRIVATE_TX_TYPE.TO_PRIVATE;
      } else if (isToPublic()) {
        transactionType = PRIVATE_TX_TYPE.TO_PUBLIC;
      }
      const historyEvent = new HistoryEvent(
        config,
        senderAssetTargetBalance,
        txStatus.extrinsic,
        transactionType
      );
      appendHistoryEvent(historyEvent);
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
        const response = await axios
          .post(`${config.SUBSCAN_API_ENDPOINT}/extrinsic`, {
            hash: tx.extrinsicHash
          })
          .catch((error) => {
            console.log(error);
          });
        const data = response?.data.data;
        if (data) {
          const status = data?.success
            ? HISTORY_EVENT_STATUS.SUCCESS
            : HISTORY_EVENT_STATUS.FAILURE;
          updateHistoryEventStatus(status, tx.extrinsicHash);
        } else {
          const createdTime = new Date(tx.date).getTime();
          const currentTime = new Date().getTime();
          if (currentTime - createdTime > 200000) {
            removePendingHistoryEvent(tx.extrinsicHash);
          }
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        getPendingPrivateTransaction().length !== 0 &&
        !txStatus?.isProcessing()
      ) {
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
      if (privateAddress && privateAddress !== getLastSeenPrivateAddress()) {
        setLastSeenPrivateAddress(privateAddress);
        if (getPrivateTransactionHistory().length > 0) {
          setPrivateTransactionHistory([]);
        }
      }
    };
    resetPrivateTransactionHistory();
  }, [privateAddress]);

  return (
    <PrivateTxHistoryContext.Provider value={{}}>
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
