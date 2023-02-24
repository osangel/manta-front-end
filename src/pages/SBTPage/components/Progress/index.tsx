import { localStorageKeys } from 'constants/LocalStorageConstants';
import { useState, useEffect } from 'react';

import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import {
  GenerateStatus,
  useGenerating
} from 'pages/SBTPage/SBTContext/generatingContext';
import ProgressCircle from '../ProgressCircle';

const PROGRESS_MAX = 251.327;
const PROGRESS_SPEED = 0.20944;
const PROGRESS_BEFORE_FINISH = 226.1943;

const REMAIN_TIME_BEFORE_FINISH = 2;
const REMAIN_TIME_MAX = 20;

// count the time and progress even the user left the page
const initialProgressAndRemainTime = (externalAddress: string) => {
  let progressResult = 0;
  let timeResult = 0;
  // count the time base on address
  const finalKey = `${localStorageKeys.GeneratingStart}-${externalAddress}`;
  const generatingStart = Number(localStorage.getItem(finalKey));
  const now = Date.now();
  if (!generatingStart || now < generatingStart) {
    localStorage.setItem(finalKey, `${now}`);
  }

  const pastMin = (now - generatingStart) / 1000 / 60;
  if (!generatingStart) {
    progressResult = 0;
    timeResult = REMAIN_TIME_MAX;
  } else if (pastMin > REMAIN_TIME_MAX) {
    progressResult = PROGRESS_BEFORE_FINISH;
    timeResult = REMAIN_TIME_BEFORE_FINISH;
  } else {
    progressResult = pastMin * PROGRESS_SPEED * 60;
    timeResult = REMAIN_TIME_MAX - Math.floor(pastMin);
  }
  return { timeResult, progressResult };
};

const initialRemainTime = (externalAddress: string) => {
  return initialProgressAndRemainTime(externalAddress).timeResult;
};
const initialProgress = (externalAddress: string) => {
  return initialProgressAndRemainTime(externalAddress).progressResult;
};

const Progress = ({ externalAddress }: { externalAddress: string }) => {
  const [progress, setProgress] = useState(0);

  const [remainMinutes, setRemainMinutes] = useState(REMAIN_TIME_MAX);

  useEffect(() => {
    const newProgress = initialProgress(externalAddress);
    const newRemainMinutes = initialRemainTime(externalAddress);
    setProgress(newProgress);
    setRemainMinutes(newRemainMinutes);
  }, [externalAddress]);

  const { setCurrentStep } = useSBT();
  const { generateStatus } = useGenerating();

  useEffect(() => {
    const updateProgress = () => {
      if (progress >= PROGRESS_BEFORE_FINISH) {
        clearInterval(timer);
        return;
      }
      setProgress(Math.min(PROGRESS_BEFORE_FINISH, progress + PROGRESS_SPEED));
    };

    const timer = setInterval(updateProgress, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [progress, setCurrentStep]);

  useEffect(() => {
    const updateRemainMinutes = () => {
      if (remainMinutes <= REMAIN_TIME_BEFORE_FINISH) {
        clearInterval(timer);
        return;
      }
      setRemainMinutes(remainMinutes - 1);
    };
    const timer = setInterval(updateRemainMinutes, 60000);
    return () => {
      clearInterval(timer);
    };
  }, [remainMinutes]);

  useEffect(() => {
    const handleFinishStatus = () => {
      if (generateStatus === GenerateStatus.finished) {
        setProgress(PROGRESS_MAX);
        setRemainMinutes(0);
        // reset the generating start time before go to the next step
        localStorage.setItem(
          `${localStorageKeys.GeneratingStart}-${externalAddress}`,
          ''
        );
        setTimeout(() => {
          setCurrentStep(Step.Generated);
        }, 100);
      }
    };
    handleFinishStatus();
  }, [generateStatus, setCurrentStep, externalAddress]);

  return (
    <div className="relative w-72 h-72 mt-6 leading-6 text-center">
      <ProgressCircle progress={progress} />
      <div className="absolute text-white text-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span>Remaining</span>
        <h2 className="text-5xl">{remainMinutes}</h2>
        <span>min</span>
      </div>
    </div>
  );
};

export default Progress;
