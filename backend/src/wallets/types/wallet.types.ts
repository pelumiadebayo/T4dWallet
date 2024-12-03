import { Types } from "mongoose";
import { IWallet } from "../models/wallet.model";

export interface IWalletStates {
  prev_wallet: IWallet;
  curr_wallet: IWallet;
}

export interface IFundWalletPayload {
  amount: number;
  description: string;
}

export interface IWithdrawFundPayload
  extends Pick<IFundWalletPayload, "amount"> {
    wallet_pin: string;
  }

export interface IGetUserWalletResponse {
       _id: string;
  wallet_id: string;
  wallet_name: string;
  balance: number;
  status: string;
}

export interface IReactivateWalletResponse {
     wallet_id: string;
     status: string;
     balance: number;
     last_status_change_date: Date;
}

 
export interface IResolveWalletResponse {
  _id: string;
  wallet_id: string;
  walletName: string;
  status: string;
}

export interface IUpdateWalletPinPayload {
  newPin: string;
  oldPin: string;
}
