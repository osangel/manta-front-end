import {
  createContext,
  ReactNode,
  useState,
  useMemo,
  useContext,
  useEffect
} from 'react';
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

  const { skippedStep, onGoingTask } = useSBT();
  const { setGeneratedImgs } = useGenerating();
  const { setModelId } = useSBTTheme();
  const { setImgList } = useSBT();

  useEffect(() => {
    const checkSkipStep = () => {
      if (skippedStep) {
        if (onGoingTask?.status && onGoingTask?.urls?.length) {
          setGeneratedImgs(onGoingTask.urls);
        } else {
          setModelId(onGoingTask?.model_id ?? '');
          setImgList(onGoingTask?.urls ?? []);
        }
      }
    };
    checkSkipStep();
  }, [onGoingTask, setGeneratedImgs, setImgList, setModelId, skippedStep]);

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
