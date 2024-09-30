export type TransactionStatus = "Successful" | "Pending" | "Failed";

export enum TransactionCategory {
  WALLET_TRANSFER = "wallet transfer",
  CURRENCY_EXCHANGE = "currency exchange",
  WALLET_FUNDING = "wallet funding",
}
