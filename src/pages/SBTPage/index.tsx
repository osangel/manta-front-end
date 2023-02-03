import Navbar from 'components/Navbar';
import OnGoingTaskNotification from './components/OnGoingTaskModal';
import Main from './Main';
import { SBTContextProvider } from './SBTContext';
import { FaceRecognitionContextProvider } from './SBTContext/faceRecognitionContext';
import { SBTPrivateContextProvider } from './SBTContext/sbtPrivateWalletContext';

const SBT = () => {
  return (
    <SBTContextProvider>
      <FaceRecognitionContextProvider>
        <SBTPrivateContextProvider>
          <div className="text-white min-h-screen flex flex-col">
            <Navbar showZkBtn={true} />
            <Main />
            <OnGoingTaskNotification />
          </div>
        </SBTPrivateContextProvider>
      </FaceRecognitionContextProvider>
    </SBTContextProvider>
  );
};
export default SBT;
