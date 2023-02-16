import Icon from 'components/Icon';
import { Notification } from 'element-react';
import { SBTContextValue, Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useEffect } from 'react';

const OnGoingTaskNotification = () => {
  const { showOnGoingTask, setCurrentStep, onGoingTask, toggleSkippedStep } =
    useSBT();

  useEffect(() => {
    if (showOnGoingTask) {
      if (!document.getElementById('on-going-content')) {
        Notification({
          title: '',
          message: (
            <OnGoingTaskContent
              onGoingTask={onGoingTask}
              setCurrentStep={setCurrentStep}
              toggleSkippedStep={toggleSkippedStep}
            />
          ),
          duration: 0,
          offset: 80
        });
      }
    } else {
      // hack Notification component does not support to close it mannually
      let dom = document.getElementById('on-going-content');
      while (dom?.parentElement && dom?.parentElement !== document.body) {
        dom = dom.parentElement;
      }
      dom?.remove();
    }
  }, [onGoingTask, setCurrentStep, showOnGoingTask, toggleSkippedStep]);

  return null;
};

const OnGoingTaskContent = ({
  onGoingTask,
  setCurrentStep,
  toggleSkippedStep
}: Pick<
  SBTContextValue,
  'onGoingTask' | 'setCurrentStep' | 'toggleSkippedStep'
>) => {
  const handleStep = () => {
    toggleSkippedStep(true);
    if (onGoingTask?.status && onGoingTask?.urls?.length) {
      setCurrentStep(Step.Generated);
    } else {
      setCurrentStep(Step.Generating);
    }
  };

  return (
    <div className="flex cursor-pointer" id="on-going-content">
      <Icon name="warning" fill="#FFA132" />
      <div className="flex flex-col ml-4">
        <p className="text-white text-sm">You have an ongoing task</p>
        <p
          className="text-white text-xs flex text-opacity-60"
          onClick={handleStep}>
          Click here to check
          <Icon name="circleArrow" className="ml-2" />
        </p>
      </div>
    </div>
  );
};
export default OnGoingTaskNotification;
