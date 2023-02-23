import { usePrivateWallet } from 'contexts/privateWalletContext';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';
import { useSend } from '../SendContext';

const useReceiverText = () => {
  const { receiverCurrentBalance, receiverAddress, receiverIsPrivate } =
    useSend();
  const { isInitialSync } = usePrivateWallet();
  const { apiState } = useSubstrate();

  const apiIsDisconnected =
    apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

  const balanceText = getZkTransactBalanceText(
    receiverCurrentBalance,
    apiIsDisconnected,
    receiverIsPrivate(),
    isInitialSync.current
  );

  const shouldShowLoader =
    receiverAddress && !receiverCurrentBalance && !balanceText;

  return { balanceText, shouldShowLoader };
};

export default useReceiverText;
