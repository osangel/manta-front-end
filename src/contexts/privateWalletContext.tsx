// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import BN from 'bn.js';
import Balance from 'types/Balance';
import TxStatus from 'types/TxStatus';
import { Network } from '../utils/sdk';
import { useExternalAccount } from './externalAccountContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';

const PrivateWalletContext = createContext();

export const PrivateWalletContextProvider = (props) => {
  // external contexts
  const { api, socket } = useSubstrate();
  const { externalAccountSigner, externalAccount, privateProvider, walletVersion } = useExternalAccount();
  const { setTxStatus, txStatusRef } = useTxStatus();

  // private wallet
  const [privateAddress, setPrivateAddress] = useState(null);

  // signer connection
  const signerIsConnected = useMemo(() => {
    return !!privateProvider;
  });
  const [isReady, setIsReady] = useState(false);
  const isInitialSync = useRef(false);

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);
  const [balancesAreStale, _setBalancesAreStale] = useState(false);
  const balancesAreStaleRef = useRef(false);
  const currentNetwork = useMemo(() => `${Network.Dolphin}`);

  const setBalancesAreStale = (areBalancesStale) => {
    balancesAreStaleRef.current = areBalancesStale;
    _setBalancesAreStale(areBalancesStale);
  };

  useEffect(() => {
    setIsReady(signerIsConnected);
  }, [signerIsConnected]);

  // Wallet must be reinitialized when socket changes
  // because the old api will have been disconnected
  useEffect(() => {
    setIsReady(false);
  }, [socket]);

  useEffect(() => {
    const canInitWallet = () => {
      return (
        signerIsConnected &&
        !isInitialSync.current
      );
    };

    const initWallet = async () => {
      isInitialSync.current = true;
      const privateAddress = await privateProvider.getZkAddress();
      setPrivateAddress(privateAddress);
      // setPrivateAddress('EEi5GnBESRt2jsPyi79c9SnzQXnBbkiFD4YfoYvacBwT');
      isInitialSync.current = false;
    };

    if (canInitWallet() && !isReady) {
      initWallet();
    }
  }, [api, signerIsConnected]);

  const sync = async () => {
    // Don't refresh during a transaction to prevent stale balance updates
    // from being applied after the transaction is finished
    if (txStatusRef.current?.isProcessing()) {
      return;
    }
    await privateProvider.walletSync(currentNetwork);
    setBalancesAreStale(false);
  };

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (isReady) {
  //       sync();
  //     }
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, [isReady]);

  const getSpendableBalance = async (assetType) => {
    if (!isReady || balancesAreStaleRef.current) {
      return null;
    }
    const balanceRaw = await privateProvider.getPrivateBalance({
      network: currentNetwork,
      assetId: `${assetType.assetId}`,
    });

    if (!balanceRaw) {
      return null;
    }
    
    // const balanceRaw = new BN('0');
    return new Balance(assetType, new BN(balanceRaw));
  };

  const handleInternalTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
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
      } catch (e) {
        console.error('Error publishing private transaction batch', e);
        setTxStatus(TxStatus.failed('Transaction declined'));
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
    const signResult = await privateProvider.toPublicBuild({
      network: currentNetwork,
      assetId: new BN(balance.assetType.assetId),
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount.address,
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
  };

  const privateTransfer = async (balance, recipient, txResHandler) => {
    const signResult = await privateProvider.privateTransferBuild({
      network: currentNetwork,
      assetId: new BN(balance.assetType.assetId),
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount.address,
      toPrivateAddress: recipient,
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
  };

  const toPrivate = async (balance, txResHandler) => {
    const signResult = await privateProvider.toPrivateBuild({
      network: currentNetwork,
      assetId: new BN(balance.assetType.assetId),
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount.address,
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
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
    signerVersion: walletVersion,
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
