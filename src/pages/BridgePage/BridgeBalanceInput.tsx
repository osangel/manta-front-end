// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Balance from 'types/Balance';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import { useBridgeData } from 'pages/BridgePage/BridgeContext/BridgeDataContext';
import BalanceInput from '../../components/Balance/BalanceInput';

const BridgeBalanceInput = () => {
  const {
    isApiDisconnected,
    senderAssetCurrentBalance,
    setSenderAssetTargetBalance,
    senderAssetType,
    maxInput,
    originAddress
  } = useBridgeData();
  const shouldShowLoader = originAddress && !senderAssetCurrentBalance && !isApiDisconnected;
  const balanceText = isApiDisconnected
    ? 'Connecting to network'
    : senderAssetCurrentBalance?.toString();

  const [inputValue, setInputValue] = useState('');

  const onChangeSendAmountInput = (value) => {
    if (value === '') {
      setSenderAssetTargetBalance(null);
      setInputValue('');
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          senderAssetType,
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gt(new BN(0))) {
          setSenderAssetTargetBalance(targetBalance);
        } else {
          setSenderAssetTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
  };

  const onClickMax = () => {
    if (maxInput) {
      onChangeSendAmountInput(maxInput.toString());
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

BridgeBalanceInput.propTypes = {
  balanceText: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.any,
  onClickMax: PropTypes.func,
  isDisabled: PropTypes.bool
};


export default BridgeBalanceInput;
