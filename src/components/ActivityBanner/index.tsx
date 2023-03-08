import React, { useEffect, useState } from 'react';
import Icon from 'components/Icon';
import { giantSquidTimeDuring } from 'utils/time/timeDuring';
export enum BANNER_TYPE {
  GIANT_SQUID = 'GIANT_SQUID',
  DEFAULT = 'DEFAULT'
}
const ActivityBanner: React.FC<object> = () => {
  const [bannerType, setBannerType] = useState(BANNER_TYPE.DEFAULT);
  const giantSquidNav = (
    <div
      className={
        'flex h-68 cursor-pointer items-center justify-center bg-giant-squid font-red-hat-mono text-sm font-semibold leading-19 text-banner'
      }
      onClick={() => window.open('https://galxe.com/')}>
      <div className="mr-4">
        KMA holders can participate with the Giant Squid Program on Galxe.com
        now!
      </div>
      <div className="mr-4">Find more details here</div>
      <Icon className="w-4 h-4 cursor-pointer" name="activityRightArrow" />
    </div>
  );

  useEffect(() => {
    if (giantSquidTimeDuring()) {
      setBannerType(BANNER_TYPE.GIANT_SQUID);
    } else {
      setBannerType(BANNER_TYPE.DEFAULT);
    }
  }, []);
  let finalContent = null;
  if (bannerType === BANNER_TYPE.GIANT_SQUID) {
    finalContent = giantSquidNav;
  }
  return finalContent;
};
export default ActivityBanner;
