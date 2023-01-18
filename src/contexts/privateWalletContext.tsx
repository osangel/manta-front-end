// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import { BN } from 'bn.js';
import Balance from 'types/Balance';
import Version from 'types/Version';
import TxStatus from 'types/TxStatus';
import {
  PRIVATE_TX_TYPE,
  HISTORY_EVENT_STATUS,
  buildHistoryEvent
} from 'types/HistoryEvent';
import signerIsOutOfDate from 'utils/validation/signerIsOutOfDate';
import {
  MantaPrivateWallet,
  MantaUtilities,
  Environment,
  Network
} from 'manta.js-kg-dev';
import { useExternalAccount } from './externalAccountContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';
import { useConfig } from './configContext';
import {
  setPrivateTransactionHistory,
  removePendingHistoryEvent,
  appendHistoryEvent,
  getPrivateTransactionHistory
} from 'utils/persistence/privateTransactionHistory';
import {
  getPrivateAddressHistory,
  setPrivateAddressHistory
} from 'utils/persistence/privateAddressHistory';

const PrivateWalletContext = createContext();

export const PrivateWalletContextProvider = (props) => {
  // external contexts
  const config = useConfig();
  const { api, socket } = useSubstrate();
  const { externalAccountSigner, externalAccount, extensionSigner } =
    useExternalAccount();
  const { setTxStatus, txStatusRef } = useTxStatus();

  // private wallet
  const [privateAddress, setPrivateAddress] = useState(null);
  const [privateWallet, setPrivateWallet] = useState(null);

  // signer connection
  const [signerIsConnected, setSignerIsConnected] = useState(null);
  const [signerVersion, setSignerVersion] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const isInitialSync = useRef(false);

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);
  const pendingPrivateTransactionBuilder = useRef(null); // hack to avoid passing params to publishNextBatch in order to retrieve correct extrinsic hash
  const [balancesAreStale, _setBalancesAreStale] = useState(false);
  const balancesAreStaleRef = useRef(false);

  const setBalancesAreStale = (areBalancesStale) => {
    balancesAreStaleRef.current = areBalancesStale;
    _setBalancesAreStale(areBalancesStale);
  };

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

  useEffect(() => {
    setIsReady(privateWallet && signerIsConnected);
  }, [privateWallet, signerIsConnected]);

  // Wallet must be reinitialized when socket changes
  // because the old api will have been disconnected
  useEffect(() => {
    setIsReady(false);
  }, [socket]);

  useEffect(() => {
    const canInitWallet = () => {
      return (
        api &&
        signerIsConnected &&
        signerVersion &&
        !signerIsOutOfDate(config, signerVersion) &&
        !isInitialSync.current
      );
    };

    const initWallet = async () => {
      isInitialSync.current = true;
      const privateWalletConfig = {
        environment: Environment.Production,
        network: Network.Dolphin,
        loggingEnabled: true
      };
      const privateWallet = await MantaPrivateWallet.init(privateWalletConfig);
      const privateAddress = await privateWallet.getZkAddress();
      setPrivateAddress(privateAddress);
      await privateWallet.initalWalletSync();
      setPrivateAddress(privateAddress);
      setPrivateWallet(privateWallet);
      isInitialSync.current = false;
    };

    if (canInitWallet() && !isReady) {
      initWallet();
    }
  }, [api, signerIsConnected, signerVersion]);

  const fetchSignerVersion = async () => {
    try {
      const updatedSignerVersion = await MantaUtilities.getSignerVersion();
      const updatedSignerIsConnected = !!updatedSignerVersion;
      if (updatedSignerIsConnected) {
        setSignerIsConnected(true);
        if (signerVersion?.toString() !== updatedSignerVersion) {
          setSignerVersion(new Version(updatedSignerVersion));
        }
      } else {
        setSignerIsConnected(false);
        setSignerVersion(null);
        setPrivateAddress(null);
        setPrivateWallet(null);
      }
    } catch (err) {
      console.error(err);
      setSignerIsConnected(false);
      setSignerVersion(null);
      setPrivateAddress(null);
      setPrivateWallet(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      fetchSignerVersion();
    }, 1000);
    return () => interval && clearInterval(interval);
  }, [api, privateWallet]);

  const sync = async () => {
    // Don't refresh during a transaction to prevent stale balance updates
    // from being applied after the transaction is finished
    if (txStatusRef.current?.isProcessing()) {
      return;
    }
    await privateWallet.walletSync();
    setBalancesAreStale(false);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isReady) {
        sync();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isReady]);

  const getSpendableBalance = async (assetType) => {
    if (!isReady || balancesAreStaleRef.current) {
      return null;
    }
    const balanceRaw = await privateWallet.getPrivateBalance(
      new BN(assetType.assetId)
    );
    return new Balance(assetType, balanceRaw);
  };

  const handleInternalTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
          removePendingHistoryEvent();
          txQueue.current = [];
          console.error('Internal transaction failed', event);
        }
      }
    } else if (status.isFinalized) {
      console.log('Internal transaction finalized');
      await publishNextBatch();
    }
  };

  const publishNextBatch = async () => {
    const sendExternal = async () => {
      try {
        const lastTx = txQueue.current.shift();
        await lastTx.signAndSend(
          externalAccountSigner,
          finalTxResHandler.current
        );
        if (pendingPrivateTransactionBuilder.current) {
          pendingPrivateTransactionBuilder.current(lastTx.hash.toString());
          pendingPrivateTransactionBuilder.current = null;
        }
      } catch (e) {
        console.error('Error publishing private transaction batch', e);
        setTxStatus(TxStatus.failed());
        removePendingHistoryEvent();
        txQueue.current = [];
      }
    };

    const sendInternal = async () => {
      try {
        const internalTx = txQueue.current.shift();
        await internalTx.signAndSend(
          externalAccountSigner,
          handleInternalTxRes
        );
      } catch (e) {
        setTxStatus(TxStatus.failed());
        removePendingHistoryEvent();
        txQueue.current = [];
      }
    };

    if (txQueue.current.length === 0) {
      return;
    } else if (txQueue.current.length === 1) {
      sendExternal();
    } else {
      sendInternal();
    }
  };

  // build and store a pending private transaction
  const buildPrivateTransaction =
    (balance, transactionType) => (extrinsicHash) => {
      const amount = balance.toString();
      const assetBaseType = balance.assetType.baseTicker;
      const privateTx = buildHistoryEvent(
        transactionType,
        assetBaseType,
        externalAccount.address,
        amount,
        HISTORY_EVENT_STATUS.PENDING,
        config,
        extrinsicHash
      );
      appendHistoryEvent(privateTx);
    };

  const publishBatchesSequentially = async (batches, txResHandler) => {
    txQueue.current = batches;
    finalTxResHandler.current = txResHandler;
    try {
      publishNextBatch();
      return true;
    } catch (e) {
      console.error('Sequential baching failed', e);
      return false;
    }
  };

  const toPublic = async (balance, txResHandler) => {
    const signResult = await privateWallet.toPublicBuild(
      new BN(balance.assetType.assetId),
      balance.valueAtomicUnits,
      extensionSigner,
      externalAccount.address
    );
    if (signResult === null) {
      return false;
    }
    const batches = signResult.txs;
    pendingPrivateTransactionBuilder.current = buildPrivateTransaction(
      balance,
      PRIVATE_TX_TYPE.TO_PUBLIC
    );
    const res = await publishBatchesSequentially(batches, txResHandler);
    return res;
  };

  const privateTransfer = async (balance, recipient, txResHandler) => {
    const signResult = await privateWallet.privateTransferBuild(
      new BN(balance.assetType.assetId),
      balance.valueAtomicUnits,
      recipient,
      extensionSigner,
      externalAccount.address
    );
    if (signResult === null) {
      return false;
    }
    const batches = signResult.txs;
    pendingPrivateTransactionBuilder.current = buildPrivateTransaction(
      balance,
      PRIVATE_TX_TYPE.PRIVATE_TRANSFER
    );
    const res = await publishBatchesSequentially(batches, txResHandler);
    return res;
  };

  const toPrivate = async (balance, txResHandler) => {
    const signResult = await privateWallet.toPrivateBuild(
      new BN(balance.assetType.assetId),
      balance.valueAtomicUnits,
      extensionSigner,
      externalAccount.address
    );
    if (signResult === null) {
      return false;
    }
    const batches = signResult.txs;
    pendingPrivateTransactionBuilder.current = buildPrivateTransaction(
      balance,
      PRIVATE_TX_TYPE.TO_PRIVATE
    );
    const res = await publishBatchesSequentially(batches, txResHandler);
    return res;
  };

  const value = {
    isReady,
    privateAddress,
    getSpendableBalance,
    toPrivate,
    toPublic,
    privateTransfer,
    sync,
    signerIsConnected,
    signerVersion,
    isInitialSync,
    setBalancesAreStale,
    balancesAreStale,
    balancesAreStaleRef
  };

  return (
    <PrivateWalletContext.Provider value={value}>
      {props.children}
    </PrivateWalletContext.Provider>
  );
};

PrivateWalletContextProvider.propTypes = {
  children: PropTypes.any
};

export const usePrivateWallet = () => ({ ...useContext(PrivateWalletContext) });
