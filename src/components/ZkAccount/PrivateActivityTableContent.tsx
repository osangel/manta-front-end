//@ts-nocheck
import classNames from 'classnames';
import { useConfig } from 'contexts/configContext';
import { getPrivateTransactionHistory } from 'utils/persistence/privateTransactionHistory';
import { PRIVATE_TX_TYPE, HISTORY_EVENT_STATUS } from 'types/HistoryEvent';
import Icon from 'components/Icon';
import Balance from 'types/Balance';

const PrivateActivityTableContent = () => {
  const config = useConfig();
  const allPrivateTransactionHistory = getPrivateTransactionHistory().reverse();
  const privateTransactionHistory = allPrivateTransactionHistory.filter((historyEvent) => {
    return historyEvent.network === config.network;
  });

  if (privateTransactionHistory.length > 0) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {privateTransactionHistory.map((historyEvent, _) => (
          <PrivateActivityItem
            historyEvent={historyEvent}
            key={historyEvent.extrinsicHash}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div className="whitespace-nowrap text-center mt-6">
        You have no activity yet.
      </div>
    );
  }
};

const PrivateActivityItem = ({ historyEvent }) => {
  const {
    transactionType,
    transactionMsg,
    jsonBalance,
    date,
    status,
    subscanUrl
  } = historyEvent;

  const balance = Balance.fromJson(jsonBalance);
  const amount = balance.toString();
  const assetBaseType = balance.assetType.baseTicker;
  const dateString = `${date.split(' ')[2]} ${date.split(' ')[1]}`;
  const onCLickHandler = (subscanUrl) => () => {
    if (subscanUrl) {
      window.open(subscanUrl, '_blank', 'noopener');
    }
  };

  return (
    <div
      onClick={onCLickHandler(subscanUrl)}
      className="flex flex-col hover:bg-thirdry hover:cursor-pointer">
      <div className="flex items-center justify-between pl-2.5 pr-3.5 py-1.5 text-sm">
        <div className="flex flex-col">
          <div className="text-white">{transactionMsg}</div>
          <ActivityMessage
            transactionType={transactionType}
            amount={amount}
            assetBaseType={assetBaseType}
          />
          <StatusMessage status={status} />
        </div>
        <div className="text-white">{dateString}</div>
      </div>
    </div>
  );
};

const ActivityMessage = ({ transactionType, amount, assetBaseType }) => {
  if (transactionType === PRIVATE_TX_TYPE.TO_PRIVATE) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} ${assetBaseType}`}
        <Icon name={'threeRightArrow'} />
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.TO_PUBLIC) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} zk${assetBaseType}`}
        <Icon name={'threeRightArrow'} />
        {`${amount} ${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER) {
    return (
      <div className="text-secondary text-xss">
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  } else {
    return null;
  }
};

const StatusMessage = ({ status }) => {
  let textColor;
  if (status === HISTORY_EVENT_STATUS.FAILED) {
    textColor = 'text-red-500';
  } else if (status === HISTORY_EVENT_STATUS.PENDING) {
    textColor = 'text-yellow-500';
  } else if (status === HISTORY_EVENT_STATUS.SUCCESS) {
    textColor = 'text-green-300';
  }
  const StatusMessageTemplate = ({ iconName, message }) => {
    return (
      <div
        className={classNames(
          'text-xss flex flex-row items-center gap-1',
          textColor
        )}>
        <Icon name={iconName} />
        {message}
      </div>
    );
  };
  if (status === HISTORY_EVENT_STATUS.SUCCESS) {
    return (
      <StatusMessageTemplate
        iconName={'txSuccess'}
        message={HISTORY_EVENT_STATUS.SUCCESS}
      />
    );
  } else if (status === HISTORY_EVENT_STATUS.FAILED) {
    return (
      <StatusMessageTemplate
        iconName={'txFailed'}
        message={HISTORY_EVENT_STATUS.FAILED}
      />
    );
  } else if (status === HISTORY_EVENT_STATUS.PENDING) {
    return (
      <StatusMessageTemplate
        iconName={'txPending'}
        message={HISTORY_EVENT_STATUS.PENDING}
      />
    );
  } else {
    return null;
  }
};

export default PrivateActivityTableContent;
