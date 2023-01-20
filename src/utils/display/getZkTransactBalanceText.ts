import { bool } from '@polkadot/types';
import Balance from 'types/Balance';

const getZkTransactBalanceText = (
  balance: Balance | null,
  apiIsDisconnected: boolean,
  isPrivate: boolean,
  isInitialSync: bool
) => {
  if (apiIsDisconnected) {
    return 'Connecting to network';
  } else if (isInitialSync && isPrivate) {
    return 'Syncing zk account';
  } else if (balance) {
    return balance.toString();
  } else {
    return '';
  }
};

export default getZkTransactBalanceText;
