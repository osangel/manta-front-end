//@ts-nocheck
import React, { useEffect, createContext, useContext } from 'react';
import * as axios from 'axios';
import { usePrivateWallet } from 'contexts/privateWalletContext';
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
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from  'contexts/configContext';
import { useSend } from '../SendContext';

const PENDING_TX_MAX_WAIT_MS = 200000;
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

  const getTransactionType = () => {
    let transactionType;
    if (isPrivateTransfer()) {
      transactionType = PRIVATE_TX_TYPE.PRIVATE_TRANSFER;
    } else if (isToPrivate()) {
      transactionType = PRIVATE_TX_TYPE.TO_PRIVATE;
    } else if (isToPublic()) {
      transactionType = PRIVATE_TX_TYPE.TO_PUBLIC;
    }
    return transactionType;
  };

  useEffect(() => {
    if (
      (isPrivateTransfer() || isToPrivate() || isToPublic()) &&
      txStatus?.isProcessing() &&
      txStatus?.extrinsic
    ) {
      const historyEvent = new HistoryEvent(
        config,
        senderAssetTargetBalance,
        txStatus.extrinsic,
        getTransactionType()
      );
      appendHistoryEvent(historyEvent);
    }
  }, [txStatus]);

  /**
   * Update history event status When page loads
   */

  const getPendingHistoryEvents = () => {
    return getPrivateTransactionHistory().filter(
      (tx) => tx.status === HISTORY_EVENT_STATUS.PENDING
    );
  };

  const syncPendingHistoryEvents = async () => {
    const pendingHistoryEvents = getPendingHistoryEvents();

    await pendingHistoryEvents.forEach(async (tx) => {
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
          if (currentTime - createdTime > PENDING_TX_MAX_WAIT_MS) {
            removePendingHistoryEvent(tx.extrinsicHash);
          }
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (getPendingHistoryEvents().length !== 0 && !txStatus?.isProcessing()) {
        syncPendingHistoryEvents();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Reset Private Transaction History When private address change
   */

  useEffect(() => {
    const resetHistoryEvents = () => {
      if (privateAddress && privateAddress !== getLastSeenPrivateAddress()) {
        setLastSeenPrivateAddress(privateAddress);
        if (getPrivateTransactionHistory().length > 0) {
          setPrivateTransactionHistory([]);
        }
      }
    };
    resetHistoryEvents();
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
