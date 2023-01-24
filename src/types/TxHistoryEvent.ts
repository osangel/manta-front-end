import Balance from './Balance';
import AssetType from './AssetType';
import BN from 'bn.js';

export enum HISTORY_EVENT_STATUS {
  FAILED = 'Failed',
  SUCCESS = 'Success',
  PENDING = 'Pending'
}

export enum PRIVATE_TX_TYPE {
  TO_PRIVATE = 'toPrivate',
  TO_PUBLIC = 'toPublic',
  PRIVATE_TRANSFER = 'privateTransfer'
}

export enum TransactionMsgAction {
  Send = 'Send',
  Transact = 'Transact'
}

export type JsonBalance = {
  assetType: AssetType;
  valueAtomicUnits: string;
};

export default class TxHistoryEvent {
  transactionType: PRIVATE_TX_TYPE;
  balance: Balance | JsonBalance;
  date: Date;
  status: HISTORY_EVENT_STATUS;
  extrinsicHash: string;
  subscanUrl: string;
  network: string;
  constructor(
    config: any,
    balance: Balance,
    extrinsicHash: string,
    transactionType: PRIVATE_TX_TYPE
  ) {
    const subscanUrl = `${config.SUBSCAN_URL}/extrinsic/${extrinsicHash}`;
    this.transactionType = transactionType;
    this.balance = balance;
    this.date = new Date();
    this.status = HISTORY_EVENT_STATUS.PENDING;
    this.extrinsicHash = extrinsicHash;
    this.subscanUrl = subscanUrl;
    this.network = config.network;
  }

  toJson() {
    const jsonBalance = {
      assetType: this.balance.assetType,
      valueAtomicUnits: this.balance.valueAtomicUnits.toString()
    };
    this.balance = jsonBalance;
  }

  static fromJson(txHistoryEvent: TxHistoryEvent) {
    const balance = new Balance(
      txHistoryEvent.balance.assetType,
      new BN(txHistoryEvent.balance.valueAtomicUnits)
    );
    txHistoryEvent.date = new Date(txHistoryEvent.date);
    txHistoryEvent.balance = balance;
  }
}
