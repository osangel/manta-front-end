import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useContext,
  useState
} from 'react';
import axios from 'axios';

import { useConfig } from 'contexts/configContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useGenerated } from './generatedContext';
import { ThemeItem, useSBTTheme } from './sbtThemeContext';
import { GenerateStatus, useGenerating } from './generatingContext';
import { GeneratedImg, useSBT } from './';

type MintContextValue = {
  getWatermarkedImgs: () => Promise<Set<GeneratedImg>>;
  saveMintInfo: (mintSet: Set<GeneratedImg>) => void;
  mintSuccessed: boolean;
  toggleMintSuccessed: (mintSuccessed: boolean) => void;
  resetContextData: () => void;
};

const MintContext = createContext<MintContextValue | null>(null);

export const MintContextProvider = ({ children }: { children: ReactNode }) => {
  const [mintSuccessed, toggleMintSuccessed] = useState(false);

  const config = useConfig();
  const { modelId, toggleCheckedThemeItem } = useSBTTheme();
  const { setGeneratedImgs, setGenerateStatus } = useGenerating();
  const { mintSet, setMintSet } = useGenerated();
  const { externalAccount } = useExternalAccount();
  const { setImgList } = useSBT();

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

  const resetContextData = useCallback(() => {
    setImgList([]);
    toggleCheckedThemeItem(new Map<string, ThemeItem>());
    setGeneratedImgs([]);
    setGenerateStatus(GenerateStatus.doing);
    setMintSet(new Set());
  }, [
    setGenerateStatus,
    setGeneratedImgs,
    setImgList,
    setMintSet,
    toggleCheckedThemeItem
  ]);

  const saveMintInfo = useCallback(
    async (mintSet: Set<GeneratedImg>) => {
      const url = `${config.SBT_NODE_SERVICE}/npo/proofs`;
      const data = {
        proof_info: [...mintSet].map(({ proofId, assetId, blur_url }) => ({
          proof_id: proofId,
          asset_id: assetId,
          blur_url,
          token: 'manta',
          size: '1'
        })),
        address: externalAccount?.address,
        model_id: modelId
      };
      const ret = await axios.post<{ status: boolean }>(url, data);
      if (ret.status === 200 || ret.status === 201) {
        toggleMintSuccessed(ret.data.status);
      }
    },
    [config.SBT_NODE_SERVICE, externalAccount?.address, modelId]
  );

  const value = useMemo(
    () => ({
      getWatermarkedImgs,
      saveMintInfo,
      mintSuccessed,
      toggleMintSuccessed,
      resetContextData
    }),
    [getWatermarkedImgs, saveMintInfo, mintSuccessed, resetContextData]
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
