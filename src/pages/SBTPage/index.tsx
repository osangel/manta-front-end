import Navbar from 'components/Navbar';
import OnGoingTaskNotification from './components/OnGoingTaskModal';
import Main from './Main';
import { SBTContextProvider } from './SBTContext';
import { FaceRecognitionContextProvider } from './SBTContext/faceRecognitionContext';
import { SBTPrivateContextProvider } from './SBTContext/sbtPrivateWalletContext';
import { SBTThemeContextProvider } from './SBTContext/sbtThemeContext';

const SBT = () => {
  return (
    <SBTContextProvider>
      <FaceRecognitionContextProvider>
        <SBTThemeContextProvider>
          <SBTPrivateContextProvider>
            <div className="text-white min-h-screen flex flex-col">
              <Navbar showZkBtn={true} />
              <Main />
              <OnGoingTaskNotification />
            </div>
          </SBTPrivateContextProvider>
        </SBTThemeContextProvider>
      </FaceRecognitionContextProvider>
    </SBTContextProvider>
  );
};
export default SBT;
