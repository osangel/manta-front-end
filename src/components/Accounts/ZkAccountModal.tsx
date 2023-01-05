//@ts-nocheck
import React, { useState } from 'react';
import classNames from 'classnames';
import MantaIcon from 'resources/images/manta.png';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useZkAccountBalances } from 'contexts/zkAccountBalancesContext';
import CopyPasteIcon from 'components/CopyPasteIcon';
import Svgs from 'resources/icons';

const PrivateTokenItem = ({ balance }) => {
  return (
    <div className="flex items-center justify-between pl-2.5 pr-3.5 py-2 text-sm hover:bg-thirdry">
      <div className="flex gap-3 items-center">
        <img className="w-8 h-8 rounded-full" src={balance.assetType.icon} />
        <div>
          <div className="text-white">{balance.assetType.ticker}</div>
          <div className="text-secondary">
            {balance.privateBalance.toString()}
          </div>
        </div>
      </div>
      <div className="text-white">{'$0.00'}</div>
    </div>
  );
};

const PrivateAssetTableContent = ({ balances }) => {
  const privateWallet = usePrivateWallet();
  if (balances && balances.length > 0) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {balances.map((balance, _) => (
          <PrivateTokenItem balance={balance} key={balance.assetType.assetId} />
        ))}
      </div>
    );
  } else if (privateWallet?.balancesAreStaleRef.current) {
    return <div className="whitespace-nowrap text-center">Syncing...</div>;
  } else {
    return (
      <div className="whitespace-nowrap text-center">
        You have no zkAssets yet.
      </div>
    );
  }
};

const PrivateActivityItem = ({ transaction }) => {
  const { transactionType, assetBaseType, amount, date, status, subscanUrl } =
    transaction;

  const ActivityMessage = () => {
    if (transactionType === 'Deposit') {
      return (
        <div className="text-secondary text-xss flex flex-row items-center gap-2">
          {`${amount} ${assetBaseType}`}
          <img src={Svgs.ThreeRightArrowIcon} alt={'ThreeArrowRightIcon'} />
          {`${amount} zk${assetBaseType}`}
        </div>
      );
    } else if (transactionType === 'Send') {
      return (
        <div className="text-secondary text-xss">
          {`${amount} zk${assetBaseType}`}
        </div>
      );
    }
  };

  const StatusMessage = () => {
    let textColor;
    if (status === 'Failed') {
      textColor = 'text-red-500';
    } else if (status === 'Pending') {
      textColor = 'text-yellow-500';
    } else if (status === 'Success') {
      textColor = 'text-green-300';
    }
    const StatusMessageTemplate = ({ iconSrc, iconAlt, message }) => {
      return (
        <div
          className={classNames(
            'text-xss flex flex-row items-center gap-1',
            textColor
          )}>
          <img src={iconSrc} alt={iconAlt} />
          {message}
        </div>
      );
    };
    if (status === 'Success') {
      return (
        <StatusMessageTemplate
          iconSrc={Svgs.TxSuccessIcon}
          iconAlt={'TxSuccessIcon'}
          message={'Success'}
        />
      );
    } else if (status === 'Failed') {
      return (
        <StatusMessageTemplate
          iconSrc={Svgs.TxFailedIcon}
          iconAlt={'TxFailedIcon'}
          message={'Failed'}
        />
      );
    } else if (status === 'Pending') {
      return (
        <StatusMessageTemplate
          iconSrc={Svgs.TxPendingIcon}
          iconAlt={'TxPendingIcon'}
          message={'Pending'}
        />
      );
    }
  };

  const dateString = `${date.split(' ')[2]} ${date.split(' ')[1]}`;

  return (
    <a
      href={subscanUrl}
      className="flex flex-col hover:bg-thirdry"
      target="_blank"
      rel="noreferrer">
      <div className="flex items-center justify-between pl-2.5 pr-3.5 py-1.5 text-sm">
        <div className="flex flex-col">
          <div className="text-white">{transactionType}</div>
          <ActivityMessage />
          <StatusMessage />
        </div>
        <div className="text-white">{dateString}</div>
      </div>
    </a>
  );
};

const PrivateActivityTableContent = () => {

  // Dummy Data used for testing
  const privateTransactionHistory = [
    {
      transactionType: 'Transact',
      assetBaseType: 'KAR',
      amount: '100',
      date: 'Wed, 14 Jun 2017 07:00:00 GMT',
      status: 'Pending',
      subscanUrl:
        'https://dolphin.subscan.io/extrinsic/0xa5770659ea5f915604cbb3f9ecc799a805e3cd73a91bb45db45851251f64cb51'
    },
    {
      transactionType: 'Transact',
      assetBaseType: 'KAR',
      amount: '200',
      date: 'Wed, 14 Jun 2017 07:00:01 GMT',
      status: 'Success',
      subscanUrl:
        'https://dolphin.subscan.io/extrinsic/0xa5770659ea5f915604cbb3f9ecc799a805e3cd73a91bb45db45851251f64cb51'
    },
    {
      transactionType: 'Send',
      assetBaseType: 'KAR',
      amount: '50',
      date: 'Wed, 14 Jun 2017 07:00:02 GMT',
      status: 'Failed',
      subscanUrl:
        'https://dolphin.subscan.io/extrinsic/0xa5770659ea5f915604cbb3f9ecc799a805e3cd73a91bb45db45851251f64cb51'
    }
  ];

  if (privateTransactionHistory && privateTransactionHistory.length > 0) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {privateTransactionHistory.map((transaction, _) => (
          <PrivateActivityItem
            transaction={transaction}
            key={transaction.date}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div className="whitespace-nowrap text-center">
        You have no activity yet.
      </div>
    );
  }
};

const TableContentSelector = ({
  displayAssets,
  displayAssetsHandler,
  displayActivityHandler
}) => {
  return (
    <div className="flex items-center text-white-60">
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayAssetsHandler}>
        <div
          className={classNames('pt-4 pb-2.5', {
            'text-white': displayAssets
          })}>
          Assets
        </div>
        <img
          src={displayAssets ? Svgs.BlueSolidLineIcon : Svgs.GrayThinLineIcon}
          alt="line"
        />
      </div>
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayActivityHandler}>
        <div
          className={classNames('pt-4 pb-2.5', {
            'text-white': !displayAssets
          })}>
          Activity
        </div>
        <img
          src={displayAssets ? Svgs.GrayThinLineIcon : Svgs.BlueSolidLineIcon}
          alt="line"
        />
      </div>
    </div>
  );
};

const ZkAccountModalContent = () => {
  const { privateAddress } = usePrivateWallet();
  const { balances } = useZkAccountBalances();
  const [displayAssets, setDisplayAssets] = useState(false);

  const displayAssetsHandler = () => {
    setDisplayAssets(true);
  };

  const displayActivityHandler = () => {
    setDisplayAssets(false);
  };

  const succinctAddress = `${privateAddress.slice(
    0,
    6
  )}..${privateAddress.slice(-4)}`;
  return (
    <>
      <div className="w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
        <div className="flex flex-col gap-3">
          <div className="border border-secondary bg-white bg-opacity-5 rounded-lg p-2 text-secondary flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <img className="w-6 h-6" src={MantaIcon} alt="Manta" />
              <span className="text-white font-light">
                zkAddress&nbsp;
                {succinctAddress}
              </span>
            </div>
            <CopyPasteIcon className="w-5 h-5" textToCopy={privateAddress} />
          </div>
          <div className="border border-secondary bg-white bg-opacity-5 rounded-lg p-1 text-secondary flex flex-col justify-center items-center">
            <span className="pt-3 pb-1 text-base text-white">
              Total Balance
            </span>
            <div className="text-white pb-3 text-2xl font-bold">{'$0.00'}</div>
          </div>
        </div>
        <TableContentSelector
          displayAssets={displayAssets}
          displayAssetsHandler={displayAssetsHandler}
          displayActivityHandler={displayActivityHandler}
        />
        <div className="overflow-y-auto h-50">
          {displayAssets ? (
            <PrivateAssetTableContent balances={balances} />
          ) : (
            <PrivateActivityTableContent />
          )}
        </div>
      </div>
    </>
  );
};

const NoZkAccountModal = () => {
  return (
    <div className="w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
      <div className="whitespace-nowrap text-center">
        You have no zkAccount yet.
      </div>
    </div>
  );
};

const ZkAccountModal = () => {
  const { privateAddress } = usePrivateWallet();
  return privateAddress ? <ZkAccountModalContent /> : <NoZkAccountModal />;
};

export default ZkAccountModal;
