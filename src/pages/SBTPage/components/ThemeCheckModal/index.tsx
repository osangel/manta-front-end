import { localStorageKeys } from 'constants/LocalStorageConstants';
import { useEffect, useMemo, useState } from 'react';
import BN from 'bn.js';

import DotLoader from 'components/Loaders/DotLoader';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useSBTPrivateWallet } from 'pages/SBTPage/SBTContext/sbtPrivateWalletContext';
import { useConfig } from 'contexts/configContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useSBTTheme } from 'pages/SBTPage/SBTContext/sbtThemeContext';
import Balance from 'types/Balance';
import Icon from 'components/Icon';
import { useExternalAccount } from 'contexts/externalAccountContext';
import ButtonWithSignerAndWallet from '../ButtonWithSignerAndWallet';

const BtnComponent = ({ loading }: { loading: boolean }) => {
  return (
    <>
      Confirm
      {loading && <DotLoader />}
    </>
  );
};
const ThemeCheckModal = ({ hideModal }: { hideModal: () => void }) => {
  const [loading, toggleLoading] = useState(false);

  const { setCurrentStep, nativeTokenBalance } = useSBT();
  const { checkedThemeItems, generateImgs } = useSBTTheme();
  const { reserveSBT, getReserveGasFee, reserveGasFee } = useSBTPrivateWallet();
  const config = useConfig();
  const { txStatus } = useTxStatus();
  const { externalAccount } = useExternalAccount();
  // TODO: just for test, will remove before release
  const PRE_SBT_PRICE = Balance.Native(config, new BN('178400000000000000000'));

  const toGeneratingPage = async () => {
    if (loading) {
      return;
    }
    toggleLoading(true);
    try {
      await reserveSBT();
    } catch (e) {
      toggleLoading(false);

      console.error(e);
    }
  };

  useEffect(() => {
    getReserveGasFee();
  }, [getReserveGasFee]);

  useEffect(() => {
    const handleTxFinalized = async () => {
      if (txStatus?.isFinalized()) {
        await generateImgs();
        toggleLoading(false);
        hideModal();
        // reset the progress counting time when start generating new images again
        localStorage.setItem(
          `${localStorageKeys.GeneratingStart}-${externalAccount?.address}`,
          ''
        );
        setTimeout(() => {
          setCurrentStep(Step.Generating);
        }, 100);
      } else if (txStatus?.isFailed()) {
        toggleLoading(false);
      }
    };

    handleTxFinalized();
  }, [
    txStatus,
    hideModal,
    setCurrentStep,
    generateImgs,
    externalAccount?.address
  ]);

  const totalValue = reserveGasFee?.add(PRE_SBT_PRICE);

  const disabled =
    loading ||
    totalValue?.gt(nativeTokenBalance ?? Balance.Native(config, new BN(0))) ||
    reserveGasFee == null;

  const errorMsg = useMemo(() => {
    if (nativeTokenBalance == null) {
      return 'Some problems occurred, please try again later.';
    }
    if (nativeTokenBalance != null && totalValue?.gt(nativeTokenBalance)) {
      return 'Your account does not have enough balance for this transaction.';
    }
    return '';
  }, [nativeTokenBalance, totalValue]);

  return (
    <div className="text-white w-128 text-center">
      <h2 className="text-2xl text-left font-bold">Checkout</h2>
      <div className="bg-secondary rounded-lg mt-6 mb-4">
        <div className="flex justify-between p-4">
          <p>{checkedThemeItems.size} Avatars + ONE Free Mint zkSBT PLAN</p>
          <div className="flex flex-col text-right">
            <span className="text-check font-bold">
              {PRE_SBT_PRICE.toDisplayString()}
            </span>
            <span className="text-white text-opacity-60">$0 USD</span>
          </div>
        </div>
        <div className="flex justify-between border-b border-split px-4 pb-4">
          <p>Gas Fee</p>
          <span className="ml-auto text-opacity-60 text-white mr-2 text-right">
            + approximately
          </span>
          <span className="text-white font-bold">
            {reserveGasFee?.toDisplayString()}
          </span>
        </div>
        <div className="flex justify-between p-4">
          <p>Total</p>
          <div className="flex flex-col text-right">
            <span className="text-check font-bold">
              {totalValue?.toDisplayString()}
            </span>
            <span className="text-white text-opacity-60">$0 USD</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-left">
        Balance: {nativeTokenBalance?.toDisplayString() ?? '-'}
      </p>
      {errorMsg && (
        <p className="text-error mt-2 text-left">
          <Icon name="information" className="mr-2 inline-block" />
          {errorMsg}
        </p>
      )}
      <ButtonWithSignerAndWallet
        btnComponent={<BtnComponent loading={loading} />}
        onClick={toGeneratingPage}
        disabled={disabled}
        className="px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter mt-6"
      />
    </div>
  );
};

export default ThemeCheckModal;
