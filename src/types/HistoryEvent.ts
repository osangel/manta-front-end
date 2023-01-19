export enum HISTORY_EVENT_STATUS {
  FAILED = 'Failed',
  SUCCESS = 'Success',
  PENDING = 'Pending'
};

export enum PRIVATE_TX_TYPE {
  TO_PRIVATE = 'toPrivate',
  TO_PUBLIC = 'toPublic',
  PRIVATE_TRANSFER = 'privateTransfer'
}

export enum TransactionMsgAction {
  Send = 'Send',
  Transact = 'Transact'
}

export default class HistoryEvent {
  transactionType: PRIVATE_TX_TYPE;
  transactionMsg: TransactionMsgAction;
  assetBaseType: any;
  amount: number;
  date: string;
  status: HISTORY_EVENT_STATUS;
  extrinsicHash: string;
  subscanUrl: string;
  constructor(
    transactionType: PRIVATE_TX_TYPE,
    transactionMsg: TransactionMsgAction,
    assetBaseType: any,
    amount: number,
    date: string,
    status: HISTORY_EVENT_STATUS,
    extrinsicHash: string,
    subscanUrl: string
  ) {
    this.transactionType = transactionType;
    this.transactionMsg = transactionMsg;
    this.assetBaseType = assetBaseType;
    this.amount = amount;
    this.date = date;
    this.status = status;
    this.extrinsicHash = extrinsicHash;
    this.subscanUrl = subscanUrl;
  }
}


