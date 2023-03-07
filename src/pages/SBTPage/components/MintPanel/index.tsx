import { Popover } from 'element-react';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import Icon from 'components/Icon';
import { useModal } from 'hooks';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { useMint } from 'pages/SBTPage/SBTContext/mintContext';
import { GeneratedImg, Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useMemo } from 'react';
import { firstUpperCase } from 'utils/string';
import { watermarkMap, WatermarkMapType } from 'resources/images/sbt';
import { useMetamask } from 'contexts/metamaskContext';
import MintCheckModal from '../MintCheckModal';
import MintedModal from '../MintedModal';
import TokenButton, { LevelType, TokenType } from '../TokenButton';
import WatermarkTokenPanel from '../WatermarkTokenPanel';
import MetamaskButton from '../MetamaskButton';

const WatermarkSwiper = () => {
  const { mintSet } = useGenerated();
  const { activeWatermarkIndex, setActiveWatermarkIndex } = useMint();

  const handleSwiperChange = () => {
    const bullets = [
      ...document.querySelectorAll(
        '.sbt-watermark-swiper .swiper-pagination-bullet'
      )
    ];
    bullets.forEach((bullet, index) => {
      const clsList = bullet.classList;
      if (clsList.contains('swiper-pagination-bullet-active')) {
        setActiveWatermarkIndex(index);
      }
    });
  };

  return (
    <div className="relative h-content">
      <Swiper
        navigation={true}
        pagination={true}
        onSlideChange={handleSwiperChange}
        modules={[Navigation, Pagination]}
        autoplay={false}
        loop={true}
        className="w-80 h-80 rounded-3xl unselectable-text sbt-watermark-swiper">
        {[...mintSet].map((generateImg, index) => {
          const watermarkName =
            generateImg?.watermarkToken +
            firstUpperCase(generateImg?.watermarkLevel ?? '');

          return (
            <SwiperSlide key={index} className="relative">
              <img src={generateImg?.url} className="w-80 h-70 rounded-3xl" />
              {generateImg?.watermarkToken && (
                <img
                  src={watermarkMap[watermarkName as WatermarkMapType]}
                  className="absolute top-0 left-0 w-80 h-70"
                />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
      <span className="font-normal text-sm absolute right-1 bottom-3 font-red-hat-mono">{`${
        activeWatermarkIndex + 1
      }/${mintSet.size}`}</span>
    </div>
  );
};

export const tokenList = [
  {
    token: 'manta',
    checked: true,
    level: 'supreme'
  },
  {
    token: 'eth',
    checked: false,
    level: 'supreme'
  },
  {
    token: 'usdc',
    checked: true,
    level: 'master'
  },
  {
    token: 'uni',
    checked: false,
    level: 'master'
  },
  {
    token: 'wbtc',
    checked: false,
    level: 'normal'
  },
  {
    token: 'link',
    checked: true,
    level: 'normal'
  },
  {
    token: 'matic',
    checked: false,
    level: 'normal'
  },
  {
    token: 'bnb',
    checked: false,
    level: 'normal'
  },
  {
    token: 'ustd',
    checked: false,
    level: 'normal'
  },
  {
    token: 'shib',
    checked: false,
    level: 'normal'
  },
  {
    token: 'ldo',
    checked: false,
    level: 'normal'
  },
  {
    token: 'op',
    checked: false,
    level: 'normal'
  },
  {
    token: 'avax',
    checked: false,
    level: 'normal'
  },
  {
    token: 'dot',
    checked: false,
    level: 'normal'
  },
  {
    token: 'ksm',
    checked: false,
    level: 'normal'
  }
];
const mantaToken = tokenList[0];

const MintPanel = () => {
  const {
    mintSuccessed,
    toggleMintSuccessed,
    resetContextData,
    activeWatermarkIndex
  } = useMint();
  const { mintSet, setMintSet } = useGenerated();
  const { setCurrentStep } = useSBT();
  const { ethAddress } = useMetamask();

  const { ModalWrapper, showModal, hideModal } = useModal({
    closeOnBackdropClick: false
  });
  const { ModalWrapper: MintedModalWrapper, showModal: showMintedModal } =
    useModal({
      closeOnBackdropClick: false
    });

  const toHomePage = () => {
    toggleMintSuccessed(false);
    resetContextData();
    setCurrentStep(Step.Home);
  };

  const activeGeneratedImg = useMemo(
    () => [...mintSet][activeWatermarkIndex],
    [activeWatermarkIndex, mintSet]
  );

  const handleClickTokenBtn = (token: TokenType, level: LevelType) => {
    const newMintSet = new Set<GeneratedImg>();
    [...mintSet].forEach((generatedImg, index) => {
      if (index === activeWatermarkIndex) {
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

  return (
    <div className="relative flex-1 flex flex-col mx-auto mb-20 bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl font-red-hat-mono tracking-widest font-medium">
          zkSBT
        </h2>
      </div>
      <h1 className="text-3xl my-6">Mint Your zkSBT</h1>
      <div className="flex ml-6">
        <WatermarkSwiper />
        <div className="flex flex-col flex-1">
          {!ethAddress && (
            <div className="bg-secondary rounded-lg  ml-6 pb-4 font-red-hat-mono font-medium text-sm">
              <div className="text-white text-opacity-60 border-b border-split p-4 flex ">
                {/* 
              // @ts-ignore */}
                <Popover
                  trigger="hover"
                  placement="right"
                  content={'Need to Update!'}
                  className="unselectable-text">
                  <div className="flex items-center">
                    <span>Advanced Crypto Watermark</span>
                    <Icon name="question" className="ml-4 cursor-pointer" />
                  </div>
                </Popover>
              </div>
              <TokenButton
                token={mantaToken.token as TokenType}
                level={mantaToken.level as LevelType}
                checked={
                  activeGeneratedImg?.watermarkToken === mantaToken.token
                }
                handleClickTokenBtn={handleClickTokenBtn}
              />
            </div>
          )}
          {!ethAddress && (
            <div className="bg-secondary rounded-lg mt-4 ml-6 pb-4">
              <div className="text-white text-opacity-60 border-b border-split p-4 flex font-red-hat-mono font-medium text-sm">
                Connect your MetaMask to unlock more Crypto Watermarks
              </div>
              <MetamaskButton />
            </div>
          )}
          {ethAddress && (
            <WatermarkTokenPanel activeGeneratedImg={activeGeneratedImg} />
          )}
        </div>
      </div>
      {mintSuccessed ? (
        <button
          onClick={toHomePage}
          className="absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-8 left-1/2 -translate-x-1/2 transform ">
          Go to Home Page
        </button>
      ) : (
        <button
          onClick={showModal}
          className="absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-8 left-1/2 -translate-x-1/2 transform ">
          Mint
        </button>
      )}

      <ModalWrapper>
        <MintCheckModal
          hideModal={hideModal}
          showMintedModal={showMintedModal}
        />
      </ModalWrapper>
      <MintedModalWrapper>
        <MintedModal />
      </MintedModalWrapper>
    </div>
  );
};

export default MintPanel;
