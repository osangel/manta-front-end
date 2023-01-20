import Balance, { JsonBalance } from './Balance';

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

export default class HistoryEvent {
  transactionType: PRIVATE_TX_TYPE;
  transactionMsg: TransactionMsgAction;
  jsonBalance: JsonBalance;
  date: string;
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
    const transactionMsg =
      transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER
        ? TransactionMsgAction.Transact
        : TransactionMsgAction.Send;
    const subscanUrl = `${config.SUBSCAN_URL}/extrinsic/${extrinsicHash}`;
    this.transactionType = transactionType;
    this.transactionMsg = transactionMsg;
    this.jsonBalance = balance.toJson();
    this.date = new Date().toUTCString();
    this.status = HISTORY_EVENT_STATUS.PENDING;
    this.extrinsicHash = extrinsicHash;
    this.subscanUrl = subscanUrl;
    this.network = config.network;
  }
}
