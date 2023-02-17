import {
  createContext,
  ReactNode,
  useState,
  useMemo,
  useContext,
  useEffect
} from 'react';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useGenerating } from './generatingContext';
import { useSBTTheme } from './sbtThemeContext';
import { useSBT, GeneratedImg } from '.';

type GeneratedContextValue = {
  mintSet: Set<GeneratedImg>;
  setMintSet: (mintSet: Set<GeneratedImg>) => void;
};

const GeneratedContext = createContext<GeneratedContextValue | null>(null);

export const GeneratedContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [mintSet, setMintSet] = useState<Set<GeneratedImg>>(new Set());

  const { skippedStep, onGoingTask, toggleSkippedStep } = useSBT();
  const { setGeneratedImgs } = useGenerating();
  const { setModelId, setGenerateAccount } = useSBTTheme();
  const { setImgList } = useSBT();
  const { externalAccount } = useExternalAccount();

  useEffect(() => {
    const checkSkipStep = () => {
      if (skippedStep) {
        setGenerateAccount(externalAccount);
        setModelId(onGoingTask?.model_id ?? '');
        if (onGoingTask?.status && onGoingTask?.urls?.length) {
          setGeneratedImgs(onGoingTask.urls);
        } else {
          setImgList(onGoingTask?.urls ?? []);
        }
        toggleSkippedStep(false);
      }
    };
    checkSkipStep();
  }, [
    externalAccount,
    onGoingTask,
    setGenerateAccount,
    setGeneratedImgs,
    setImgList,
    setModelId,
    skippedStep,
    toggleSkippedStep
  ]);

  const value = useMemo(
    () => ({
      mintSet,
      setMintSet
    }),
    [mintSet]
  );

  return (
    <GeneratedContext.Provider value={value}>
      {children}
    </GeneratedContext.Provider>
  );
};

export const useGenerated = () => {
  const data = useContext(GeneratedContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useGenerated can only be used inside of <GeneratedContext />, please declare it at a higher level.'
    );
  }
  return data;
};
