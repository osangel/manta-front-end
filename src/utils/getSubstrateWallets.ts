import WALLET_NAME from 'constants/WalletConstants';
import { getWallets } from '@talismn/connect-wallets';

const getSubstrateWallets = () => {
  return getWallets().filter((wallet) =>
    Object.values(WALLET_NAME).includes(wallet.extensionName)
  );
};

export default getSubstrateWallets;
