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
  const { externalAccount, privateProvider, walletVersion } = useExternalAccount();
  const { setTxStatus, txStatusRef } = useTxStatus();

  // private wallet
  const [privateAddress, setPrivateAddress] = useState(null);
  const [privateWalletState, setPrivateWalletState] = useState({
    isWalletInitialized: false,
    isWalletReady: false,
    isWalletBusy: false,
  });

  // signer connection
  const signerIsConnected = useMemo(() => {
    return !!privateProvider;
  });
  const [isReady, setIsReady] = useState(false);
  const isInitialSync = useRef(false);

  // transaction state
  const [balancesAreStale, _setBalancesAreStale] = useState(false);
  const balancesAreStaleRef = useRef(false);
  const currentNetwork = useMemo(() => `${Network.Dolphin}`);

  const setBalancesAreStale = (areBalancesStale) => {
    balancesAreStaleRef.current = areBalancesStale;
    _setBalancesAreStale(areBalancesStale);
  };

  useEffect(() => {
    let timerId = -1;
    const requestState = async () => {
      if (!isReady || !externalAccount || !externalAccount.address) {
        return;
      }
      const [isWalletInitialized, isWalletReady, isWalletBusy] = await Promise.all([
        privateProvider.isWalletInitialized(),
        privateProvider.isWalletReady(),
        privateProvider.isWalletBusy(),
      ]);
      setPrivateWalletState({
        isWalletInitialized,
        isWalletReady,
        isWalletBusy,
      });
      console.log([isWalletInitialized, isWalletReady, isWalletBusy]);
      if (isWalletInitialized && !isWalletReady && !isWalletBusy) {
        await privateProvider.initWalletSync(currentNetwork);
      }
      timerId = setTimeout(requestState, 5000);
    };
    requestState();
    return () => {
      clearTimeout(timerId);
    };
  }, [isReady, currentNetwork, externalAccount]);

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
      return signerIsConnected && !isInitialSync.current && privateWalletState.isWalletReady;
    };

    const initWallet = async () => {
      isInitialSync.current = true;
      const privateAddress = await privateProvider.getZkAddress();
      setPrivateAddress(privateAddress);
      isInitialSync.current = false;
    };

    if (canInitWallet()) {
      initWallet();
    }
  }, [api, signerIsConnected, privateWalletState]);

  const sync = async () => {
    // Don't refresh during a transaction to prevent stale balance updates
    // from being applied after the transaction is finished
    if (txStatusRef.current?.isProcessing()) {
      return;
    }
    // await privateProvider.walletSync(currentNetwork);
    setBalancesAreStale(false);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isReady) {
        sync();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isReady]);

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

  const toPublic = async (balance, txResHandler) => {
    await privateProvider.walletSync(currentNetwork);
    const signResult = await privateProvider.toPublicSend({
      network: currentNetwork,
      assetId: `${balance.assetType.assetId}`,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: externalAccount.address,
    });
    if (!signResult) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    txResHandler(signResult);
  };

  const privateTransfer = async (balance, recipient, txResHandler) => {
    await privateProvider.walletSync(currentNetwork);
    const signResult = await privateProvider.privateTransferSend({
      network: currentNetwork,
      assetId: `${balance.assetType.assetId}`,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: externalAccount.address,
      toPrivateAddress: recipient,
    });
    if (!signResult) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    txResHandler(signResult);
  };

  const toPrivate = async (balance, txResHandler) => {
    await privateProvider.walletSync(currentNetwork);
    const signResult = await privateProvider.toPrivateSend({
      network: currentNetwork,
      assetId: `${balance.assetType.assetId}`,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: externalAccount.address,
    });
    if (!signResult) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    txResHandler(signResult);
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
    balancesAreStaleRef,
    privateWalletState,
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
