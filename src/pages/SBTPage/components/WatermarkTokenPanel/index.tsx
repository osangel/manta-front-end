import Icon from 'components/Icon';
import { GeneratedImg } from 'pages/SBTPage/SBTContext';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { useMint } from 'pages/SBTPage/SBTContext/mintContext';
import { useMemo, useState } from 'react';
import { tokenList } from '../MintPanel';
import TokenButton, { TokenType, LevelType } from '../TokenButton';

const WatermarkTokenPanel = ({
  activeGeneratedImg
}: {
  activeGeneratedImg: GeneratedImg;
}) => {
  const [applyAll, toggleApplyAll] = useState(false);

  const { mintSet, setMintSet } = useGenerated();
  const { activeWatermarkIndex } = useMint();

  const handleClickTokenBtn = (token: TokenType, level: LevelType) => {
    const newMintSet = new Set<GeneratedImg>();
    [...mintSet].forEach((generatedImg, index) => {
      if (index === activeWatermarkIndex || applyAll) {
        const isSelected = generatedImg.watermarkToken === token;

        newMintSet.add({
          ...generatedImg,
          watermarkToken: isSelected ? null : token,
          watermarkLevel: isSelected ? null : level
        });
      } else {
        newMintSet.add({
          ...generatedImg
        });
      }
    });
    setMintSet(newMintSet);
  };

  const applyAllDisabled = useMemo(
    () => !applyAll && !activeGeneratedImg?.watermarkToken,
    [activeGeneratedImg?.watermarkToken, applyAll]
  );
  const applyAllDisabledStyle = applyAllDisabled
    ? 'cursor-not-allowed'
    : 'cursor-pointer';

  const clickApplyAll = () => {
    if (applyAllDisabled) {
      return;
    }
    if (!applyAll) {
      const { watermarkLevel, watermarkToken } = activeGeneratedImg;
      if (watermarkLevel && watermarkToken) {
        const newMintSet = new Set<GeneratedImg>();
        [...mintSet].forEach((generatedImg) => {
          newMintSet.add({
            ...generatedImg,
            watermarkToken: watermarkToken,
            watermarkLevel: watermarkLevel
          });
        });
        setMintSet(newMintSet);
      }
    }
    toggleApplyAll(!applyAll);
  };

  return (
    <div className="bg-secondary rounded-lg mt-4 ml-6 pb-4">
      <div className="text-white text-opacity-60 border-b border-split p-4 flex font-red-hat-mono font-medium text-sm">
        Please select up to one Crypto Watermark to include in your zkSBT
      </div>
      {tokenList.map(({ token, level }, index) => {
        return (
          <TokenButton
            token={token as TokenType}
            level={level as LevelType}
            checked={activeGeneratedImg?.watermarkToken === token}
            key={index}
            handleClickTokenBtn={handleClickTokenBtn}
          />
        );
      })}
      <div
        className={`p-4 text-white text-opacity-60 text-sm flex items-center ${applyAllDisabledStyle}`}
        onClick={clickApplyAll}>
        {applyAll ? (
          <Icon name="greenCheck" className="mr-2 w-4 h-4" />
        ) : (
          <svg
            className="mr-2 w-4 h-4"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="white" fillOpacity="0.05" />
            <circle
              cx="10"
              cy="10"
              r="9.5"
              stroke="white"
              strokeOpacity="0.1"
            />
          </svg>
        )}
        Apply all
      </div>
    </div>
  );
};

export default WatermarkTokenPanel;
