//@ts-nocheck
import React, { useState } from 'react';
import classNames from 'classnames';
import MantaIcon from 'resources/images/manta.png';
import PrivateActivityTableContent from './PrivateActivityTableContent';
import PrivateAssetTableContent from './PrivateAssetTableContent';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import CopyPasteIcon from 'components/CopyPasteIcon';
import Svgs from 'resources/icons';


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
  const [displayAssets, setDisplayAssets] = useState(true);

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
            <PrivateAssetTableContent />
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
