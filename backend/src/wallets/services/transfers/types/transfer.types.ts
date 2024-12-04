export interface ITransferPayload {
  receipientId: string;
  amount: number;
  wallet_pin: string;
  description?: string;
}

export interface ITransferChargeResponse {
  newAmountWithCharge: number;
  charge: number;
  newCreditAmount: number;
}
