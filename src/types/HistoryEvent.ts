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

export default class HistoryEvent {
  transactionType: PRIVATE_TX_TYPE;
  transactionMsg: TransactionMsg;
  assetBaseType: any;
  amount: number;
  date: string;
  status: HISTORY_EVENT_STATUS;
  extrinsicHash: string;
  subscanUrl: string;
  constructor(
    transactionType: PRIVATE_TX_TYPE,
    transactionMsg: TransactionMsg,
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


enum TransactionMsg {
    Send = 'Send',
    Transact = 'Transact',
}

export const buildHistoryEvent = (
  transactionType: PRIVATE_TX_TYPE,
  assetBaseType: any,
  substrateAddress: string,
  amount: number,
  status: HISTORY_EVENT_STATUS,
  config: any,
  extrinsicHash: string
) => {
  const date = new Date().toUTCString();
  const subscanUrl = `${config.SUBSCAN_URL}/extrinsic/${extrinsicHash}`;
  const transactionMsg =
    transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER
      ? TransactionMsg.Transact
      : TransactionMsg.Send;
  return new HistoryEvent(
    transactionType,
    transactionMsg,
    assetBaseType,
    amount,
    date,
    status,
    extrinsicHash,
    subscanUrl
  );
};
