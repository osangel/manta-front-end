import CopyPasteIcon from 'components/CopyPasteIcon';
import Icon from 'components/Icon';
import { Popover } from 'element-react';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { GeneratedImg } from 'pages/SBTPage/SBTContext/index';
import asMatchImg from 'resources/images/sbt/asMatch.png';

const MintedImg = ({ blur_url, proofId = '', style }: GeneratedImg) => {
  return (
    <div className="relative w-max group">
      <img src={blur_url} className="rounded-lg w-48 h-48" />
      <span className="text-white absolute bottom-16 left-2">{style}</span>
      <div className="bg-primary px-2 py-2 flex items-center mt-6 w-48 justify-between text-xs rounded-lg">
        <p className="text-white text-opacity-60">zkSBT ID</p>
        <p className="text-white">{`${proofId?.slice(0, 6)}..${proofId?.slice(
          -4
        )}`}</p>
        <CopyPasteIcon textToCopy={proofId ?? ''} />
      </div>
    </div>
  );
};
const PopContent = () => {
  return (
    <div className="flex items-center text-xss text-white text-left">
      <img src={asMatchImg} className="w-24" />
      <p className="flex-1 ml-4">
        For AsMatch Users, please click here to copy and paste to the page at
        AsMatch App as shown on the left. If you have multiple SBTs, don’t worry
        this also works for multiple SBTs.
      </p>
    </div>
  );
};

const MintedModal = () => {
  const { mintSet } = useGenerated();
  const copyAll = () => {
    const textToCopy = [...mintSet].map(({ proofId }) => proofId).join(',');
    navigator.clipboard.writeText(textToCopy);
  };
  return (
    <div className="text-white w-240">
      <h2 className="text-2xl">MINTED！</h2>
      <p className="text-white text-opacity-60 text-xs mb-2">
        Your zkSBTs should appear in your Manta Signer. You can start using{' '}
        <span className="text-check">AsMatch</span> Match2Earn (Click to
        Download) using your newly minted
        <br /> zkSBTs. Begin by copying your zkSBT ID or by copying all zkSBT
        IDs.
      </p>
      <div className="grid w-full gap-6 grid-cols-5 pb-12 mt-6">
        {[...mintSet]?.map((generatedImg, index) => {
          return <MintedImg {...generatedImg} key={index} />;
        })}
      </div>
      <div className="flex justify-center items-center">
        <button
          className="w-60 px-4 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter"
          onClick={copyAll}>
          Click to copy all zkSBT IDs
        </button>
        {/* 
        // @ts-ignore */}
        <Popover
          trigger="hover"
          placement="right"
          content={<PopContent />}
          width="356">
          <div>
            <Icon name="question" className="ml-4 cursor-pointer" />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default MintedModal;
