import { Navigation, type Swiper as SwiperRefType } from 'swiper';

import { MutableRefObject } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss'; // core Swiper
import 'swiper/modules/navigation/navigation.scss'; // Navigation module
import 'swiper/modules/pagination/pagination.scss'; // Pagination module

import { ThemeItem, useSBT } from 'pages/SBTPage/SBTContext';
import themeMap from 'resources/images/sbt/theme';

const Item = ({ item }: { item: ThemeItem }) => {
  return (
    <div className="relative">
      <img src={item.img} className="w-96 h-96" />
      <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 trans bg-gradient rounded-lg text-sm px-2">
        {item.name}
      </span>
    </div>
  );
};
const ThemeChecked = ({
  swiperRef
}: {
  swiperRef: MutableRefObject<SwiperRefType | null>;
}) => {
  const { checkedThemeItems } = useSBT();
  if (checkedThemeItems.size === 0) {
    return <Item item={{ name: 'Anime', img: themeMap.Anime }}></Item>;
  }

  return (
    <Swiper
      className="w-96 m-0"
      autoplay={false}
      navigation={true}
      modules={[Navigation]}
      onSwiper={(swiper) => {
        swiperRef && (swiperRef.current = swiper);
      }}>
      {[...checkedThemeItems.values()].map((item) => {
        return (
          <SwiperSlide key={item.name}>
            <Item item={item} />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};
export default ThemeChecked;
