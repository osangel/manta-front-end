import { useMemo } from 'react';

import Icon from 'components/Icon';
import { useConfig } from 'contexts/configContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useSBT } from 'pages/SBTPage/SBTContext';
import signerIsOutOfDate from 'utils/validation/signerIsOutOfDate';
import Progress from '../Progress';
import SignerButton from '../SignerButton';
import WalletButton from '../WalletButton';

const UploadedImg = ({
  url,
  index,
  length
}: {
  url: string;
  index: number;
  length: number;
}) => {
  const transformStyle = `scale(${Math.pow(0.9, index)})`;
  const left = `${6 * index}rem`;
  return (
    <img
      src={url}
      className={'w-60 h-60 rounded-lg transform absolute'}
      style={{
        transform: transformStyle,
        left,
        zIndex: length - index,
        opacity: 0.9
      }}
      key={index}
    />
  );
};

const Generating = () => {
  const { imgList } = useSBT();

  const { externalAccount } = useExternalAccount();
  const { privateAddress, signerVersion } = usePrivateWallet();
  const config = useConfig();

  const bothSignerAndWalletConnected = useMemo(() => {
    if (!externalAccount) {
      return false;
    }
    if (!privateAddress || signerIsOutOfDate(config, signerVersion)) {
      return false;
    }
    return true;
  }, [config, externalAccount, privateAddress, signerVersion]);

  return (
    <div className="flex-1 flex flex-col mx-auto bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Analyzing...</h1>
      <p className="text-sm text-opacity-60 text-white mb-6">
        It will normally take 20 mins.
      </p>
      <div className="relative w-full h-60">
        {imgList.map(({ url }, index) => {
          return (
            <UploadedImg
              key={index}
              url={url ?? ''}
              index={index}
              length={imgList.length}
            />
          );
        })}
      </div>
      <div className="flex border border-dashed w-max p-4 mt-6 rounded-lg">
        <div className="flex flex-col">
          {bothSignerAndWalletConnected ? (
            <p className="text-xl pt-20">
              Please wait patiently. <br />
              Your AI profile will be ready soon
            </p>
          ) : (
            <>
              <p className="text-xl">While you are waiting...</p>
              <div className="text-warning rounded-xl py-1 my-4 flex">
                <Icon name="information" className="mr-2" />
                You will need Manta Wallet and Signer to mint your zkSBTs
              </div>
              <p className="text-white text-opacity-60">
                Have you signed in your Manta Wallet/Signer yet? <br />
                Connect now
              </p>
            </>
          )}

          <SignerButton />
          <WalletButton />
          {!bothSignerAndWalletConnected && (
            <p className="flex flex-row gap-2 mt-5 text-secondary text-xsss">
              <Icon name="information" />
              Already installed? Try refreshing this page
            </p>
          )}
        </div>
        <Progress externalAddress={externalAccount?.address} />
      </div>
    </div>
  );
};

export default Generating;
