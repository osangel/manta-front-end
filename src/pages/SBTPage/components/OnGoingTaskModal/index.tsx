import Icon from 'components/Icon';
import { Notification } from 'element-react';
import { useSBT } from 'pages/SBTPage/SBTContext';
import { useEffect } from 'react';

const OnGoingTaskNotification = () => {
  const { showOnGoingTask } = useSBT();

  useEffect(() => {
    if (showOnGoingTask) {
      Notification({
        title: '',
        message: <OnGoingTaskContent />,
        duration: 0,
        offset: 80
      });
    } else {
      // hack Notification component does not support to close it mannually
      let dom = document.getElementById('on-going-content');
      while (dom?.parentElement && dom?.parentElement !== document.body) {
        dom = dom.parentElement;
      }
      dom?.remove();
    }
  }, [showOnGoingTask]);
  return null;
};

const OnGoingTaskContent = () => {
  return (
    <div className="flex cursor-pointer" id="on-going-content">
      <Icon name="warning" fill="#FFA132" />
      <div className="flex flex-col ml-4">
        <p className="text-white text-sm">You have an ongoing task</p>
        <p className="text-white text-xs flex text-opacity-60">
          Click here to check
          <Icon name="circleArrow" className="ml-2" />
        </p>
      </div>
    </div>
  );
};
export default OnGoingTaskNotification;
