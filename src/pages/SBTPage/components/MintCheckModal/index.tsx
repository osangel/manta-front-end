import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import BN from 'bn.js';

import DotLoader from 'components/Loaders/DotLoader';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { useSBT } from 'pages/SBTPage/SBTContext';
import { useSBTPrivateWallet } from 'pages/SBTPage/SBTContext/sbtPrivateWalletContext';
import { useConfig } from 'contexts/configContext';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import { useTxStatus } from 'contexts/txStatusContext';
import TxStatus from 'types/TxStatus';
import { GeneratedImg } from 'pages/SBTPage/SBTContext/index';
import { useMint } from 'pages/SBTPage/SBTContext/mintContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useSBTTheme } from 'pages/SBTPage/SBTContext/sbtThemeContext';
import Icon from 'components/Icon';

const MintImg = ({ url }: { url: string }) => (
  <img src={url} className="w-24 h-24 rounded-2xl" />
);

const MintImgs = () => {
  const { mintSet } = useGenerated();
  return (
    <div className="w-full p-4 overflow-hidden overflow-x-auto">
      <div className="w-max flex gap-4">
        {[...mintSet].map(({ url }, index) => {
          return <MintImg url={url} key={index} />;
        })}
      </div>
    </div>
  );
};
const MintCheckModal = ({
  hideModal,
  showMintedModal
}: {
  hideModal: () => void;
  showMintedModal: () => void;
}) => {
  const [loading, toggleLoading] = useState(false);

  const proofIdRef = useRef<string[]>();

  const { mintSet, setMintSet } = useGenerated();
  const { nativeTokenBalance } = useSBT();
  const { mintGasFee, mintSBT, getMintGasFee } = useSBTPrivateWallet();
  const config = useConfig();
  const { txStatus, setTxStatus } = useTxStatus();
  const { getWatermarkedImgs } = useMint();
  const { externalAccount } = useExternalAccount();
  const { generateAccount } = useSBTTheme();

  const nativeAsset = AssetType.Native(config);

  const PRE_SBT_PRICE = useMemo(
    () => new Balance(nativeAsset, new BN(178400000000000)),
    [nativeAsset]
  );

  useEffect(() => {
    if (mintGasFee) {
      return;
    }
    getMintGasFee();
  }, [getMintGasFee, mintGasFee]);

  const mintSBTConfirm = useCallback(async () => {
    toggleLoading(true);
    try {
      const newMintSet = await getWatermarkedImgs();
      const proofIds = await mintSBT(newMintSet);
      proofIdRef.current = proofIds;
    } catch (e) {
      console.error(e);
      setTxStatus(TxStatus.failed(''));
    }
  }, [getWatermarkedImgs, mintSBT, setTxStatus]);

  useEffect(() => {
    const handleTxFinalized = () => {
      if (txStatus?.isFinalized()) {
        toggleLoading(false);
        const proofIds = proofIdRef.current;
        const newMintSet = new Set<GeneratedImg>();
        [...mintSet].forEach((generatedImg, index) => {
          newMintSet.add({
            ...generatedImg,
            proofId: proofIds?.[index]
          });
        });
        hideModal();
        setMintSet(newMintSet);
        setTimeout(() => {
          showMintedModal();
        });
      } else if (txStatus?.isFailed()) {
        toggleLoading(false);
      }
    };
    handleTxFinalized();
  }, [hideModal, mintSet, setMintSet, showMintedModal, txStatus]);

  const mintInfo = useMemo(() => {
    if (mintSet.size === 1) {
      return {
        txt: '1 Free zkSTB',
        cost: 'Free'
      };
    }
    if (mintSet.size > 1) {
      return {
        txt: `1 Free + ${mintSet.size - 1} Extra Mint`,
        cost: `${PRE_SBT_PRICE.toDisplayString()} x ${mintSet.size - 1}`
      };
    }
  }, [PRE_SBT_PRICE, mintSet.size]);

  const totalValue = useMemo(() => {
    return PRE_SBT_PRICE.mul(new BN(mintSet.size - 1)).add(
      mintGasFee ?? Balance.Native(nativeAsset, new BN(0))
    );
  }, [PRE_SBT_PRICE, mintGasFee, mintSet.size, nativeAsset]);

  const mintCostStyle = mintSet.size === 1 ? 'text-check' : 'text-white';

  const errorMsg = useMemo(() => {
    if (generateAccount?.address !== externalAccount?.address) {
      return 'The address to mint must be the same as the address to genereate.';
    }
    if (nativeTokenBalance == null || totalValue.gt(nativeTokenBalance)) {
      return 'You account does not have enough balance for this transaction.';
    }
    return '';
  }, [
    externalAccount?.address,
    generateAccount?.address,
    nativeTokenBalance,
    totalValue
  ]);

  const disabled = useMemo(
    () => loading || mintGasFee == null || !!errorMsg,
    [errorMsg, loading, mintGasFee]
  );

  const disabledStyle = disabled ? 'brightness-50 cursor-not-allowed' : '';

  return (
    <div className="text-white w-128 text-center">
      <h2 className="text-2xl text-left">Checkout</h2>
      <div className="bg-secondary rounded-lg mt-6 mb-4">
        <MintImgs />
        <div className="flex justify-between border-b border-split p-4">
          <p>{mintInfo?.txt}</p>
          <span className={`${mintCostStyle}`}>{mintInfo?.cost}</span>
        </div>
        <div className="flex justify-between border-b border-split p-4">
          <p>Gas Fee</p>
          <span className="ml-auto text-opacity-60 text-white mr-2">
            + approximately
          </span>
          <span className="text-white">{mintGasFee?.toDisplayString()}</span>
        </div>
        <div className="flex justify-between p-4">
          <p>Total</p>
          <div className="flex flex-col">
            <span className="text-check">{totalValue?.toDisplayString()}</span>
            <span className="text-white text-opacity-60">$0 USD</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-left">
        Balance: {nativeTokenBalance?.toDisplayString() ?? '-'}
      </p>
      {errorMsg && (
        <p className="mt-2 text-error text-left">
          <Icon name="information" className="mr-2 inline-block" />
          {errorMsg}
        </p>
      )}
      <button
        onClick={() => mintSBTConfirm()}
        disabled={disabled}
        className={`px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter mt-6 ${disabledStyle}`}>
        Confirm
        {loading && <DotLoader />}
      </button>
    </div>
  );
};

export default MintCheckModal;
