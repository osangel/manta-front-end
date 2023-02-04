import { useState } from 'react';
import axios from 'axios';

import DotLoader from 'components/Loaders/DotLoader';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useSBTPrivateWallet } from 'pages/SBTPage/SBTContext/sbtPrivateWalletContext';
import { useConfig } from 'contexts/configContext';
import AssetType from 'types/AssetType';

const ThemeCheckModal = ({ hideModal }: { hideModal: () => void }) => {
  const [loading, toggleLoading] = useState(false);

  const { setCurrentStep, imgList, setImgList, nativeTokenBalance } = useSBT();
  const { externalAccount } = useExternalAccount();
  const { reserveSBT } = useSBTPrivateWallet();
  const config = useConfig();

  const nativeAsset = AssetType.Native(config);

  const uploadImgs = async () => {
    const fileUploadUrl = `${config.SBT_NODE_SERVICE}/uploader/ipfs-files`;

    const formData = new FormData();
    formData.append('address', externalAccount.address);
    imgList.forEach(({ file }) => {
      formData.append('files', file);
    });
    formData.append('target', 'core');
    const ret = await axios.post(fileUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (ret.status === 200 || ret.status === 201) {
      const newImgList = [...imgList];

      ret?.data?.map((metadata: string, index: number) => {
        newImgList[index].metadata = metadata;
      });
      setImgList(newImgList);
    }
  };

  const toGeneratingPage = async () => {
    if (loading) {
      return;
    }
    toggleLoading(true);

    await uploadImgs();
    await reserveSBT();

    toggleLoading(false);

    hideModal();
    setTimeout(() => {
      setCurrentStep(Step.Generating);
    });
  };

  return (
    <div className="text-white w-128 text-center">
      <h2 className="text-2xl">Checkout</h2>
      <div className="bg-secondary rounded-lg mt-6 mb-4">
        <div className="flex justify-between p-4">
          <p>10 Avatars + ONE Free Mint zkSBT PLAN</p>
          <div className="flex flex-col">
            <span className="text-check">179.48 {nativeAsset?.baseTicker}</span>
            <span className="text-white text-opacity-60">$30.9 USD</span>
          </div>
        </div>
        <div className="flex justify-between border-b border-split p-4">
          <p>Gas Fee</p>
          <span className="ml-auto text-opacity-60 text-white mr-2">
            + approximately
          </span>
          <span className="text-white">1.88 {nativeAsset?.baseTicker}</span>
        </div>
        <div className="flex justify-between p-4">
          <p>Total</p>
          <div className="flex flex-col">
            <span className="text-check">179.84 {nativeAsset?.baseTicker}</span>
            <span className="text-white text-opacity-60">$30.9 USD</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-left">
        Balance: {nativeTokenBalance?.toString() ?? '-'}{' '}
        {nativeAsset?.baseTicker}
      </p>
      <button
        onClick={toGeneratingPage}
        disabled={loading}
        className={`px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter mt-6 ${
          loading ? 'brightness-50 cursor-not-allowed' : ''
        }`}>
        Confirm
        {loading && <DotLoader />}
      </button>
    </div>
  );
};

export default ThemeCheckModal;
