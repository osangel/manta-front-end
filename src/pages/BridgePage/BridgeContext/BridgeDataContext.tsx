// @ts-nocheck
import React, { useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useExternalAccount } from 'contexts/externalAccountContext';
import Balance from 'types/Balance';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { useMetamask } from 'contexts/metamaskContext';
import { Bridge } from 'manta-polkawallet-bridge/build';
import { useConfig } from 'contexts/configContext';
import { firstValueFrom } from 'rxjs';
import BRIDGE_ACTIONS from './bridgeActions';
import bridgeReducer, { buildInitState } from './bridgeReducer';

const BridgeDataContext = React.createContext();

export const BridgeDataContextProvider = (props) => {
  const { ethAddress } = useMetamask();
  const config = useConfig();
  const {
    externalAccount,
    externalAccountSigner
  } = useExternalAccount();

  const [state, dispatch] = useReducer(bridgeReducer, buildInitState(config));

  const {
    isApiReady,
    senderAssetType,
    senderAssetTargetBalance,
    senderAssetCurrentBalance,
    originChainOptions,
    originChain,
    destinationChain,
    bridge,
    destinationAddress
  } = state;

  const originAddress = originChain?.getXcmAdapter().chain.type === 'ethereum'
    ? ethAddress
    : externalAccount?.address;

  const originXcmAdapter = bridge?.adapters.find(
    (adapter) => adapter.chain.id === originChain?.name
  );

  const originApi = originXcmAdapter?.api;

  const originChainIsEvm = originChain?.getXcmAdapter().chain.type === 'ethereum';
  const destinationChainIsEvm = destinationChain?.getXcmAdapter().chain.type === 'ethereum';

  /**
   *
   * Initialization logic
   *
   */


  useEffect(() => {
    const initBridge = () => {
      if (bridge || !externalAccount || !externalAccountSigner || !originChainOptions) {
        return;
      }
      const adapters = originChainOptions.map((chain) => chain.getXcmAdapter());
      dispatch({
        type: BRIDGE_ACTIONS.SET_BRIDGE,
        bridge: new Bridge({ adapters }),
      });
    };
    initBridge();
  }, [externalAccountSigner, externalAccount, originChainOptions]);


  useEffect(() => {
    const initBridgeApis = () => {
      if (!bridge) {
        return;
      }
      for (const chain of originChainOptions) {
        const adapter = bridge.adapters.find((adapter) => adapter.chain.id === chain.name);
        chain.getXcmApi().then(api => {
          adapter.setApi(api);
          dispatch({
            type: BRIDGE_ACTIONS.SET_IS_API_READY,
            isApiReady: true,
            chain
          });
        });
      }
    };
    initBridgeApis();
  }, [bridge, originChainOptions]);


  /**
   *
   * Destination address logic
   *
   */

  useEffect(() => {
    const setDestinationAddressOnChangeChain = () => {
      if (originChainIsEvm || destinationChainIsEvm) {
        dispatch({
          type: BRIDGE_ACTIONS.SET_DESTINATION_ADDRESS,
          destinationAddress: null
        });
      } else {
        dispatch({
          type: BRIDGE_ACTIONS.SET_DESTINATION_ADDRESS,
          destinationAddress: externalAccount?.address
        });
      }
    };
    setDestinationAddressOnChangeChain();
  }, [originChain, destinationChain]);

  useEffect(() => {
    const setDestinationAddressOnChangeExternalAccount = () => {
      if (originChainIsEvm || destinationChainIsEvm) {
        return;
      }
      dispatch({
        type: BRIDGE_ACTIONS.SET_DESTINATION_ADDRESS,
        destinationAddress: externalAccount?.address
      });
    };
    setDestinationAddressOnChangeExternalAccount();
  }, [externalAccount]);

  /**
   *
   * Subscriptions
   *
   */

  const subscribeBalanceChanges = (assetType, handler) => {
    if (!assetType || !originAddress || !isApiReady) {
      return;
    }
    const balanceObserveable = originXcmAdapter.subscribeTokenBalance(
      assetType.logicalTicker, originAddress
    );
    return balanceObserveable.subscribe(handler);
  };

  useEffect(() => {
    const handleSenderNativeAssetBalanceChange = (balanceData) => {
      if (!isApiReady) {
        return;
      }
      const senderNativeAssetCurrentBalance = Balance.fromBaseUnits(
        originChain.nativeAsset,
        balanceData.free
      );
      dispatch({
        type: BRIDGE_ACTIONS.SET_SENDER_NATIVE_ASSET_CURRENT_BALANCE,
        senderNativeAssetCurrentBalance
      });
    };
    const subscription = subscribeBalanceChanges(
      originChain.nativeAsset, handleSenderNativeAssetBalanceChange
    );
    return () => subscription?.unsubscribe();
  }, [senderAssetType, originAddress, originChain, isApiReady]);

  useEffect(() => {
    const handleBalanceChange = (balanceData) => {
      if (!isApiReady) {
        return;
      }
      const senderAssetCurrentBalance = Balance.fromBaseUnits(
        senderAssetType,
        balanceData.free
      );
      dispatch({
        type: BRIDGE_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE,
        senderAssetCurrentBalance
      });
    };
    const subscription = subscribeBalanceChanges(senderAssetType, handleBalanceChange);
    return () => subscription?.unsubscribe();
  }, [senderAssetType, originAddress, originChain, isApiReady]);


  useEffect(() => {
    const getDestinationFee = (inputConfig) => {
      return Balance.fromBaseUnits(
        senderAssetType,
        inputConfig.destFee.balance
      );
    };
    const getOriginFee = (inputConfig) => {
      return new Balance(
        originChain.nativeAsset,
        new BN(inputConfig.estimateFee)
      );
    };
    const getMaxInput = (inputConfig) => {
      return Balance.fromBaseUnits(
        senderAssetType,
        Decimal.max(new Decimal(inputConfig.maxInput.toString()), new Decimal(0))
      );
    };
    const getMinInput = (inputConfig) => {
      return Balance.fromBaseUnits(
        senderAssetType,
        new Decimal(inputConfig.minInput.toString())
      );
    };

    const handleInputConfigChange = (inputConfig) => {
      dispatch({
        type: BRIDGE_ACTIONS.SET_FEE_ESTIMATES,
        originFee: getOriginFee(inputConfig),
        destinationFee: getDestinationFee(inputConfig),
        maxInput: getMaxInput(inputConfig),
        minInput: getMinInput(inputConfig)
      });
    };

    const getInputConfigParams = () => {
      const amount = senderAssetTargetBalance
        ? senderAssetTargetBalance.valueBaseUnits.toString()
        : '0';

      let address = destinationAddress;
      // allows us to get fee estimates for EVM chains even when destination address not set
      if (destinationChainIsEvm) {
        const ARBITRARY_EVM_ADDRESS = '0x000000000000000000000000000000000000dead';
        address = ARBITRARY_EVM_ADDRESS;
      }
      return {
        signer: originAddress,
        address: address,
        amount: amount,
        to: destinationChain.name,
        token: senderAssetType.logicalTicker
      };
    };

    const subscribeInputConfig = async () => {
      if (
        !senderAssetType
        || !originAddress
        || !isApiReady
        || !originChain
      ) {
        return;
      }
      const inputConfigParams = getInputConfigParams();
      const inputConfigObservable = originXcmAdapter.subscribeInputConfigs(inputConfigParams);
      const inputConfig = await firstValueFrom(inputConfigObservable);
      handleInputConfigChange(inputConfig);
    };
    subscribeInputConfig();
  },[
    senderAssetType, senderAssetCurrentBalance, senderAssetTargetBalance,
    originAddress, destinationAddress, originChain, destinationChain, isApiReady
  ]);

  /**
   *
   * Mutations exposed through UI
   */

  // Sets the asset type to be transacted
  const setSelectedAssetType = (selectedAssetType) => {
    dispatch({ type: BRIDGE_ACTIONS.SET_SELECTED_ASSET_TYPE, selectedAssetType });
  };

  // Sets the balance the user intends to send
  const setSenderAssetTargetBalance = (senderAssetTargetBalance) => {
    dispatch({
      type: BRIDGE_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE,
      senderAssetTargetBalance
    });
  };

  // Sets the origin chain
  const setOriginChain = (originChain) => {
    dispatch({
      type: BRIDGE_ACTIONS.SET_ORIGIN_CHAIN,
      originChain,
      isApiReady: getIsApiReady(originChain)
    });
  };

  // Sets the destination chain
  const setDestinationChain = (destinationChain) => {
    dispatch({
      type: BRIDGE_ACTIONS.SET_DESTINATION_CHAIN,
      destinationChain
    });
  };

  // Sets the destination address (only used when bridging too or from EVM chains like Moonriver)
  const setDestinationAddress = (destinationAddress) => {
    dispatch({
      type: BRIDGE_ACTIONS.SET_DESTINATION_ADDRESS,
      destinationAddress
    });
  };

  // Switches origin and destination chain
  const switchOriginAndDestination = () => {
    if (originChain && destinationChain) {
      dispatch({
        type: BRIDGE_ACTIONS.SWITCH_ORIGIN_AND_DESTINATION,
        isApiReady: getIsApiReady(destinationChain)
      });
    }
  };

  // Returns true if the given chain's api is ready
  const getIsApiReady = (chain) => {
    const targetAdapter = bridge?.adapters.find(
      (adapter) => adapter.chain.id === chain?.name
    );
    return !!targetAdapter?.api?.isReady;
  };

  const value = {
    originAddress,
    originApi,
    originXcmAdapter,
    originChainIsEvm,
    destinationChainIsEvm,
    setSenderAssetTargetBalance,
    setSelectedAssetType,
    setOriginChain,
    setDestinationChain,
    setDestinationAddress,
    switchOriginAndDestination,
    ...state
  };

  return (
    <BridgeDataContext.Provider value={value}>{props.children}</BridgeDataContext.Provider>
  );
};

BridgeDataContextProvider.propTypes = {
  children: PropTypes.any
};

export const useBridgeData = () => ({ ...useContext(BridgeDataContext) });
