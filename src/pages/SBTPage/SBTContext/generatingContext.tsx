import axios from 'axios';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect
} from 'react';

import { useConfig } from 'contexts/configContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useSBTTheme } from './sbtThemeContext';
import { Step, useSBT } from '.';
import { GeneratedImg } from './index';

export enum GenerateStatus {
  finished,
  doing
}

type GeneratingContextValue = {
  generatedImgs: GeneratedImg[];
  generateStatus: GenerateStatus;
  setGeneratedImgs: (generatedImgs: GeneratedImg[]) => void;
  queryGenerateResult: () => void;
};

const GeneratingContext = createContext<GeneratingContextValue | null>(null);

const INTERVAL_MILLISECONDS = 120000;

export const GeneratingContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [generatedImgs, setGeneratedImgs] = useState<GeneratedImg[]>([]);
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>(
    GenerateStatus.doing
  );

  const config = useConfig();
  const { modelId } = useSBTTheme();
  const { externalAccount } = useExternalAccount();
  const { currentStep } = useSBT();

  const queryGenerateResult = useCallback(async () => {
    const url = `${config.SBT_NODE_SERVICE}/npo/model`;
    const data = {
      model_id: modelId,
      address: externalAccount?.address
    };
    const ret = await axios.post<GeneratedImg[]>(url, data);
    if (ret.status === 200 || ret.status === 201) {
      if (ret?.data?.length) {
        setGeneratedImgs(ret?.data);
        setGenerateStatus(GenerateStatus.finished);
      }
    }
  }, [config.SBT_NODE_SERVICE, externalAccount?.address, modelId]);

  const value = useMemo(
    () => ({
      generatedImgs,
      generateStatus,
      queryGenerateResult,
      setGeneratedImgs
    }),
    [generateStatus, generatedImgs, queryGenerateResult]
  );

  useEffect(() => {
    let timer: any = null;

    const queryGenereateResultInAnalyzingPage = () => {
      if (currentStep === Step.Generating && timer === null) {
        timer = setInterval(() => {
          queryGenerateResult();
        }, INTERVAL_MILLISECONDS);
      }
    };
    queryGenereateResultInAnalyzingPage();

    return () => clearInterval(timer);
  }, [currentStep, queryGenerateResult]);

  return (
    <GeneratingContext.Provider value={value}>
      {children}
    </GeneratingContext.Provider>
  );
};

export const useGenerating = () => {
  const data = useContext(GeneratingContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useGenerating can only be used inside of <GeneratingContext />, please declare it at a higher level.'
    );
  }
  return data;
};
