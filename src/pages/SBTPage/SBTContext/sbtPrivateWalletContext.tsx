import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback
} from 'react';
import {
  DispatchError,
  EventRecord,
  ExtrinsicStatus,
  RuntimeDispatchInfo,
  SignedBlock
} from '@polkadot/types/interfaces';
import type { ITuple } from '@polkadot/types/types';
// @ts-ignore:next-line
import { SbtMantaPrivateWallet, Environment, Network } from 'mantasbt.js';

import TxStatus from 'types/TxStatus';
import { useTxStatus } from 'contexts/txStatusContext';
import extrinsicWasSentByUser from 'utils/api/ExtrinsicWasSendByUser';
import BN from 'bn.js';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import { useConfig } from '../../../contexts/configContext';
import { useSubstrate } from '../../../contexts/substrateContext';
import { usePrivateWallet } from '../../../contexts/privateWalletContext';
import { useExternalAccount } from '../../../contexts/externalAccountContext';
import { useGenerated } from './generatedContext';
import { GeneratedImg } from './';

export type SBTPrivateWalletValue = {
  reserveSBT: () => void;
  getReserveGasFee: () => void;
  reserveGasFee: Balance | null;
  getMintGasFee: () => void;
  mintGasFee: Balance | null;
  mintSBT: (mintSet: Set<GeneratedImg>) => Promise<string[]>;
};

const SBTPrivateWalletContext = createContext<SBTPrivateWalletValue | null>(
  null
);

export const SBTPrivateContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [sbtPrivateWallet, setSBTPrivateWallet] =
    useState<SbtMantaPrivateWallet | null>(null);
  const isInitialSync = useRef(false);
  const [reserveGasFee, setReserveGasFee] = useState<Balance | null>(null);
  const [mintGasFee, setMintGasFee] = useState<Balance | null>(null);

  const config = useConfig();
  const { api } = useSubstrate();
  const { isReady } = usePrivateWallet();
  const { extensionSigner, externalAccount } = useExternalAccount();
  const { setTxStatus } = useTxStatus();
  const { mintSet } = useGenerated();

  const nativeAsset = useMemo(() => AssetType.Native(config), [config]);

  useEffect(() => {
    const canInitWallet = api && !isInitialSync.current && !sbtPrivateWallet;

    const initWallet = async () => {
      isInitialSync.current = true;
      const privateWalletConfig = {
        environment: Environment.Production,
        network: Network.Dolphin,
        loggingEnabled: true
      };
      console.log('init sbtPrivateWallet before');
      const sbtPrivateWallet = await SbtMantaPrivateWallet.initSBT(
        privateWalletConfig
      );
      console.log('init sbtPrivateWallet after', sbtPrivateWallet);

      await sbtPrivateWallet.initalWalletSync();
      setSBTPrivateWallet(sbtPrivateWallet);
      isInitialSync.current = false;
    };

    if (canInitWallet && !isReady) {
      initWallet();
    }
  }, [api, config, isReady, sbtPrivateWallet]);

  const getReserveGasFee = useCallback(async () => {
    if (!sbtPrivateWallet || !externalAccount) {
      return;
    }
    const reserveSbt = await sbtPrivateWallet.buildReserveSbt(
      extensionSigner,
      externalAccount.address
    );

    const gasFee: RuntimeDispatchInfo = await reserveSbt.paymentInfo(
      externalAccount.address
    );
    const value = new Balance(
      nativeAsset,
      new BN(gasFee.partialFee.toString())
    );
    setReserveGasFee(value);
  }, [extensionSigner, externalAccount, nativeAsset, sbtPrivateWallet]);

  const handleTxRes = useCallback(
    async ({
      status,
      events
    }: {
      status: ExtrinsicStatus;
      events: EventRecord[];
    }) => {
      if (status.isInBlock || status.isFinalized) {
        const systemEvents = events.filter(
          ({ event: { section } }) => section === 'system'
        );
        for (const event of systemEvents) {
          if (api.events.system.ExtrinsicFailed.is(event.event)) {
            const [error] = event.event.data as unknown as ITuple<
              DispatchError[]
            >;
            if (error.isModule) {
              const decoded = api.registry.findMetaError(
                error.asModule.toU8a()
              );
              const { docs, method, section } = decoded;
              console.error(`${section}.${method}: ${docs.join(' ')}`);
            } else {
              console.error(error.toString());
            }
            setTxStatus(TxStatus.failed(''));
          } else if (api.events.system.ExtrinsicSuccess.is(event.event)) {
            try {
              const signedBlock: SignedBlock = status.isInBlock
                ? await sbtPrivateWallet.api.rpc.chain.getBlock(
                  status.asInBlock
                )
                : await sbtPrivateWallet.api.rpc.chain.getBlock(
                  status.asFinalized
                );
              const extrinsics = signedBlock.block.extrinsics;
              const extrinsic = extrinsics.find((extrinsic) =>
                extrinsicWasSentByUser(extrinsic, externalAccount, api)
              );
              const extrinsicHash = extrinsic?.hash.toHex();
              setTxStatus(TxStatus.finalized(extrinsicHash));
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    },
    [api, externalAccount, sbtPrivateWallet, setTxStatus]
  );

  const reserveSBT = useCallback(async () => {
    if (!sbtPrivateWallet || !externalAccount) {
      return;
    }
    const reserveSbt = await sbtPrivateWallet.buildReserveSbt(
      extensionSigner,
      externalAccount.address
    );

    setTxStatus(TxStatus.processing(''));
    try {
      await reserveSbt.signAndSend(externalAccount.address, handleTxRes);
    } catch (e: any) {
      console.log('Failed to send a transaction', e);
      setTxStatus(TxStatus.failed('Transaction declined'));
    }
  }, [
    extensionSigner,
    externalAccount,
    handleTxRes,
    sbtPrivateWallet,
    setTxStatus
  ]);

  const getBatchMintTx = useCallback(
    async (newMintSet: Set<GeneratedImg> = mintSet) => {
      if (!sbtPrivateWallet || !externalAccount || !api?.query) {
        return;
      }
      const assetIdRange =
        await sbtPrivateWallet.api.query.mantaSbt.reservedIds(
          externalAccount.address
        );
      if (assetIdRange.isNone) {
        console.error('no assetId in storage mapped to this account');
        return;
      }
      const assetId = assetIdRange.unwrap()[0];

      await sbtPrivateWallet.getPrivateBalance(assetId);

      const numberOfMints = newMintSet.size;
      const metadata = [...newMintSet].map(
        (genereatedImg) => genereatedImg?.cid
      );
      const sbtMint = await sbtPrivateWallet.buildSbtBatch(
        extensionSigner,
        externalAccount.address,
        assetId,
        numberOfMints,
        metadata
      );
      return sbtMint;
    },
    [api?.query, extensionSigner, externalAccount, mintSet, sbtPrivateWallet]
  );

  const mintSBT = useCallback(
    async (newMintSet: Set<GeneratedImg>) => {
      const sbtMint = await getBatchMintTx(newMintSet);
      const { batchTx, transactionDatas } = sbtMint;

      await batchTx.signAndSend(externalAccount.address, handleTxRes);
      return transactionDatas;
    },
    [externalAccount?.address, getBatchMintTx, handleTxRes]
  );

  const getMintGasFee = useCallback(async () => {
    const sbtMint = await getBatchMintTx();
    const { batchTx } = sbtMint;
    const { partialFee } = (await batchTx?.paymentInfo(
      externalAccount.address
    )) ?? { partialFee: '' };

    const value = new Balance(nativeAsset, new BN(partialFee.toString()));
    setMintGasFee(value);
  }, [externalAccount?.address, getBatchMintTx, nativeAsset]);

  const value = useMemo(() => {
    return {
      reserveSBT,
      reserveGasFee,
      getReserveGasFee,
      getMintGasFee,
      mintGasFee,
      mintSBT
    };
  }, [
    reserveSBT,
    reserveGasFee,
    getReserveGasFee,
    getMintGasFee,
    mintGasFee,
    mintSBT
  ]);
  return (
    <SBTPrivateWalletContext.Provider value={value}>
      {children}
    </SBTPrivateWalletContext.Provider>
  );
};

export const useSBTPrivateWallet = () => {
  const data = useContext(SBTPrivateWalletContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useSBTPrivateWallet can only be used inside of <SBTPrivateWalletContext />, please declare it at a higher level.'
    );
  }
  return data;
};
