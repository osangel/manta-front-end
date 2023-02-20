import {
  createContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useCallback,
  RefObject,
  useContext,
  useRef
} from 'react';
import * as faceapi from 'face-api.js';
import { useSBT } from '.';

type FaceRecognitionContextValue = {
  modelsLoaded: boolean;
  detectionResults: Array<DetectionResult[]>;
  detectFaces: (ref: RefObject<HTMLDivElement>) => void;
  handleRemove: (index: number) => void;
  checkInvalid: (index: number) => boolean;
  errorMsg: string;
  themeGender: faceapi.Gender;
  getGender: () => void;
  detectLoading: boolean;
};

type DetectionResult = faceapi.WithAge<
  faceapi.WithGender<{
    detection: faceapi.FaceDetection;
  }>
>;
const MIN_CONFIDENCE = 0.6;

const FaceRecognitionContext =
  createContext<FaceRecognitionContextValue | null>(null);

export const FaceRecognitionContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionResults, setDectionResults] = useState(
    [] as Array<DetectionResult[]>
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [themeGender, setThemeGender] = useState<faceapi.Gender>(
    faceapi.Gender.MALE
  );
  const [detectLoading, toggleDetectLoading] = useState(false);

  const detectCountRef = useRef<number>(0);

  const { imgList, setImgList } = useSBT();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.load(MODEL_URL)
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const detectFaces = useCallback(async (imgContainer) => {
    const count = detectCountRef.current;

    toggleDetectLoading(true);

    const imgEls: HTMLImageElement[] = [
      ...(imgContainer?.current?.querySelectorAll('img') ?? [])
    ];
    const options = new faceapi.SsdMobilenetv1Options({
      minConfidence: MIN_CONFIDENCE
    });

    const detectionPromises = [] as any[];

    imgEls.forEach((imgEl) => {
      if (imgEl.dataset.detected) {
        detectionPromises.push(
          Promise.resolve(JSON.parse(imgEl.dataset.detected))
        );
      } else {
        detectionPromises.push(
          faceapi.detectAllFaces(imgEl, options).withAgeAndGender()
        );
      }
    });
    const detectionResults: Array<DetectionResult[]> = await Promise.all(
      detectionPromises
    );
    toggleDetectLoading(false);

    // if user click remove mutilple times, detectFaces will be called mutilple times
    // but the result might not returned in order
    // using ref.current to count how many times detectFaces being called
    // do nothing with the old ones
    if (count !== detectCountRef?.current) {
      return;
    }
    detectCountRef.current = ++detectCountRef.current;

    imgEls.forEach((imgEl, index) => {
      imgEl.dataset.detected = JSON.stringify(detectionResults[index]);
    });

    setDectionResults(detectionResults);
  }, []);

  const handleRemove = useCallback(
    (index: number) => {
      const newArr = [...imgList];
      newArr.splice(index, 1);
      setImgList(newArr);

      if (!newArr.length) {
        setDectionResults([]);
        return;
      }

      const newDetectionResults = [...detectionResults];
      newDetectionResults.splice(index, 1);
      setDectionResults(newDetectionResults);
    },
    [detectionResults, imgList, setImgList]
  );

  const getUploadIsFailed = useCallback(
    (index: number) => {
      return !imgList[index]?.success;
    },
    [imgList]
  );

  const getDetectionIsInvalid = useCallback(
    (index: number) => {
      if (!modelsLoaded || !detectionResults.length) {
        return false;
      }
      const detectionResult = detectionResults[index];

      // At the momnent of the image is uploaded, it's detectionResult will be undefined
      // because the detection is not finish yet
      if (detectionResult === undefined) {
        return false;
      }

      return (
        !detectionResult ||
        !detectionResult.length ||
        detectionResult?.length > 1 ||
        detectionResult[0]?.detection?.score < MIN_CONFIDENCE
      );
    },
    [detectionResults, modelsLoaded]
  );

  useEffect(() => {
    const getErrorMsg = () => {
      for (let i = 0; i < detectionResults.length; i++) {
        const invalid = getDetectionIsInvalid(i);
        if (invalid) {
          setErrorMsg(
            'You have at least one invalid picture uploaded (we cannot detect a face). Please remove it in order to proceed.'
          );
          return;
        }
      }

      for (let i = 0; i < imgList.length; i++) {
        const invalid = getUploadIsFailed(i);
        if (invalid) {
          setErrorMsg('Upload Failed, please try again.');
          return;
        }
      }

      setErrorMsg('');
    };
    getErrorMsg();
  }, [
    getDetectionIsInvalid,
    detectionResults,
    errorMsg,
    imgList,
    getUploadIsFailed
  ]);

  const checkInvalid = useCallback(
    (index: number) => {
      return getDetectionIsInvalid(index) || getUploadIsFailed(index);
    },
    [getDetectionIsInvalid, getUploadIsFailed]
  );

  const getGender = useCallback(() => {
    let femaleAmount = 0;
    detectionResults.forEach((delectionResult) => {
      const ret = delectionResult[0];
      if (ret.gender === faceapi.Gender.FEMALE) {
        femaleAmount++;
      }
    });
    if (femaleAmount > detectionResults.length / 2) {
      setThemeGender(faceapi.Gender.FEMALE);
    }
  }, [detectionResults, setThemeGender]);

  const value = useMemo(
    () => ({
      modelsLoaded,
      detectionResults,
      detectFaces,
      handleRemove,
      checkInvalid,
      getGender,
      errorMsg,
      themeGender,
      setThemeGender,
      detectLoading
    }),
    [
      modelsLoaded,
      detectionResults,
      detectFaces,
      handleRemove,
      checkInvalid,
      getGender,
      errorMsg,
      themeGender,
      detectLoading
    ]
  );

  return (
    <FaceRecognitionContext.Provider value={value}>
      {children}
    </FaceRecognitionContext.Provider>
  );
};

export const useFaceRecognition = () => {
  const data = useContext(FaceRecognitionContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useFaceRecognition can only be used inside of <FaceRecognitionContext />, please declare it at a higher level.'
    );
  }
  return data;
};
