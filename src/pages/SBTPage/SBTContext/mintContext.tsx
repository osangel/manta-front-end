import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useContext
} from 'react';
import axios from 'axios';

import { useConfig } from 'contexts/configContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useGenerated } from './generatedContext';
import { useSBTTheme } from './sbtThemeContext';
import { GeneratedImg } from './';

type MintContextValue = {
  getWatermarkedImgs: () => Promise<Set<GeneratedImg>>;
};

const MintContext = createContext<MintContextValue | null>(null);

export const MintContextProvider = ({ children }: { children: ReactNode }) => {
  const config = useConfig();
  const { modelId } = useSBTTheme();
  const { mintSet, setMintSet } = useGenerated();
  const { externalAccount } = useExternalAccount();

  const getWatermarkedImgs = useCallback(async () => {
    const url = `${config.SBT_NODE_SERVICE}/npo/watermark`;
    const data = {
      url: [...mintSet].map(({ url }) => url),
      token: 'manta',
      size: 1,
      address: externalAccount?.address,
      model_id: modelId
    };
    const newMintSet = new Set<GeneratedImg>();
    const ret = await axios.post<GeneratedImg[]>(url, data);
    if (ret.status === 200 || ret.status === 201) {
      [...mintSet].forEach((generatedImg, index) => {
        newMintSet.add({
          ...generatedImg,
          ...ret.data[index]
        });
      });
    }
    setMintSet(newMintSet);
    return newMintSet;
  }, [
    config.SBT_NODE_SERVICE,
    externalAccount?.address,
    mintSet,
    modelId,
    setMintSet
  ]);

  const value = useMemo(
    () => ({
      getWatermarkedImgs
    }),
    [getWatermarkedImgs]
  );
  return <MintContext.Provider value={value}>{children}</MintContext.Provider>;
};

export const useMint = () => {
  const data = useContext(MintContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useMint can only be used inside of <MintContext />, please declare it at a higher level.'
    );
  }
  return data;
};
