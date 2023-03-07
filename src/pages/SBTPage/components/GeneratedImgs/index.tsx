import Icon from 'components/Icon';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect, useRef } from 'react';
import { type Swiper as SwiperRef } from 'swiper';

import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { useGenerating } from 'pages/SBTPage/SBTContext/generatingContext';
import { GeneratedImg } from 'pages/SBTPage/SBTContext/index';
import { MAX_MINT_SIZE } from '../Generated';

const PRE_SCALE = 0.07;
const MAX_Z_INDEX = 60;
const MAX_IMG_LEN = 10;
const MIN_LOOP = 10;

type ItemType = {
  generatedImg: GeneratedImg;
  toggleMint: (generatedImg: GeneratedImg) => void;
};
const GeneratedImgItem = ({ generatedImg, toggleMint }: ItemType) => {
  const { mintSet } = useGenerated();

  const checkedStyle = mintSet.has(generatedImg) ? 'border-4 border-check' : '';
  const disabledStyle =
    mintSet.size >= MAX_MINT_SIZE && !mintSet.has(generatedImg)
      ? 'cursor-not-allowed filter grayscale'
      : 'cursor-pointer';

  return (
    <>
      <img
        src={generatedImg?.url}
        className={`rounded-xl ${checkedStyle} ${disabledStyle} img-bg unselectable-text`}
        onClick={() => toggleMint(generatedImg)}
      />
      {mintSet.has(generatedImg) && (
        <Icon name="greenCheck" className="absolute bottom-4 left-4" />
      )}
    </>
  );
};

const GeneratedImgs = () => {
  const { generatedImgs } = useGenerating();
  const { mintSet, setMintSet } = useGenerated();

  const toggleMint = (generatedImg: GeneratedImg) => {
    const newMintSet = new Set(mintSet);
    if (newMintSet.has(generatedImg)) {
      newMintSet.delete(generatedImg);
    } else {
      if (newMintSet.size >= MAX_MINT_SIZE) {
        return;
      }
      newMintSet.add(generatedImg);
    }
    setMintSet(newMintSet);
  };

  const swiperRef = useRef<SwiperRef | null>(null);

  // hack for handling image scale
  const scaleSwiperSlide = () => {
    if (swiperRef?.current) {
      const wraper = swiperRef?.current?.$el[0];
      const slides = [
        ...wraper.querySelectorAll('.swiper-slide')
      ] as unknown as HTMLDivElement[];

      const activeSlide = wraper.querySelector(
        '.swiper-slide-active'
      ) as unknown as HTMLDivElement;
      if (!activeSlide) {
        return;
      }
      const activeIndex = slides.findIndex((slide) => slide === activeSlide);

      slides.forEach((slide, index) => {
        slide.style.transform = `scale(${Math.max(
          0.5,
          1 - Math.abs(index - activeIndex) * PRE_SCALE
        )})`;
        if (activeIndex < index) {
          slide.style.zIndex = `${MAX_Z_INDEX - index}`;
        } else {
          slide.style.zIndex = `${index}`;
        }
      });
      activeSlide.style.zIndex = `${MAX_Z_INDEX}`;
    }
  };

  useEffect(() => {
    scaleSwiperSlide();
  }, []);

  return (
    <div className="w-full mx-auto">
      {generatedImgs.length ? (
        <Swiper
          autoplay={false}
          slidesPerView={MAX_IMG_LEN}
          centeredSlides={true}
          spaceBetween={-90}
          initialSlide={Math.min(
            MAX_IMG_LEN / 2,
            Math.floor(generatedImgs.length / 2)
          )}
          slideToClickedSlide={true}
          modules={[]}
          className="generated-swiper"
          onSwiper={(swiper) => {
            swiperRef && (swiperRef.current = swiper);
          }}
          onSlideChange={() =>
            setTimeout(() => {
              scaleSwiperSlide();
            }, 100)
          }
          loop={generatedImgs.length >= MIN_LOOP}
          allowTouchMove={false}>
          {generatedImgs.map((generatedImg, index) => {
            return (
              <SwiperSlide
                key={index}
                className="transform scale-75 transition-transform opacity-90">
                <GeneratedImgItem
                  generatedImg={generatedImg}
                  toggleMint={toggleMint}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : null}
    </div>
  );
};

export default GeneratedImgs;