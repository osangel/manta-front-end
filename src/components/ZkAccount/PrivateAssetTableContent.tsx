import { usePrivateWallet } from 'contexts/privateWalletContext';
import {
  useZkAccountBalances,
  ZkAccountBalance
} from 'contexts/zkAccountBalancesContext';
import { useSend } from 'pages/SendPage/SendContext';
import PrivateAssetItem from './PrivateAssetItem';

const PrivateAssetTableContent = () => {
  const { balances } = useZkAccountBalances();
  const { senderIsPrivate, receiverIsPrivate } = useSend();
  const privateWallet = usePrivateWallet();
  const isInitialSync = privateWallet?.isInitialSync?.current;
  const shouldSyncZKAccount =
    isInitialSync && (senderIsPrivate() || receiverIsPrivate());

  if (balances?.length) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {balances.map((balance: ZkAccountBalance) => (
          <PrivateAssetItem balance={balance} key={balance.assetType.assetId} />
        ))}
      </div>
    );
  } else if (shouldSyncZKAccount) {
    return (
      <div className="whitespace-nowrap text-center mt-6">
        Syncing zk account
      </div>
    );
  } else if (privateWallet?.balancesAreStaleRef.current) {
    return <div className="whitespace-nowrap text-center mt-6">Syncing...</div>;
  } else {
    return (
      <div className="whitespace-nowrap text-center mt-6">
        You have no zkAssets yet.
      </div>
    );
  }
};

export default PrivateAssetTableContent;
