// @ts-nocheck
import { useSend } from 'pages/SendPage/SendContext';
import { useEffect, useState } from 'react';
import handleChangeBalanceInput from 'utils/validation/handleChangeBalanceInput';
import BalanceInput from '../../components/Balance/BalanceInput';
import useSenderBalanceText from './SendToForm/useSenderBalanceText';

const SendBalanceInput = () => {
  const {
    senderAssetTargetBalance,
    setSenderAssetTargetBalance,
    senderAssetType,
    getMaxSendableBalance
  } = useSend();
  const [inputValue, setInputValue] = useState('');
  const {balanceText,shouldShowLoader} = useSenderBalanceText();

  const onChangeSendAmountInput = (newInputValue) => {
    handleChangeBalanceInput({
      newInputString: newInputValue,
      prevInputString: inputValue,
      setInputString: setInputValue,
      setBalance: setSenderAssetTargetBalance,
      assetType: senderAssetType
    });
  };

  useEffect(() => {
    const truncateDecimalsOnChangeAssetType = () => {
      senderAssetTargetBalance && onChangeSendAmountInput(senderAssetTargetBalance.toStringUnrounded());
    };
    truncateDecimalsOnChangeAssetType();
  }, [senderAssetType]);


  const onClickMax = () => {
    const maxSendableBalance = getMaxSendableBalance();
    if (maxSendableBalance) {
      onChangeSendAmountInput(maxSendableBalance.toString());
    }
  };

  return (
    <BalanceInput
      onChangeAmountInput={onChangeSendAmountInput}
      inputValue={inputValue}
      onClickMax={onClickMax}
      balanceText={balanceText}
      shouldShowLoader={shouldShowLoader}
    />
  );
};

export default SendBalanceInput;
