import React from 'react';
import DotLoader from 'components/Loaders/DotLoader';

interface IBalanceDisplayProps {
  balance: string;
  className: string;
  loader: boolean;
}

const BalanceDisplay: React.FC<IBalanceDisplayProps> = ({
  balance,
  className,
  loader
}) => {
  let balanceDisplay = balance;
  if (!balance && !loader) {
    balanceDisplay = '--';
  } else if (!balance) {
    balanceDisplay = '';
  }

  return (
    <div id="balanceText" className={className}>
      {!loader ? (
        <div>
          Balance <span className="font-red-hat-mono">{balanceDisplay}</span>
        </div>
      ) : (
        <DotLoader />
      )}
    </div>
  );
};

export default BalanceDisplay;
