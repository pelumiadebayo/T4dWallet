import { Request, Response } from "express";
import {
  errorHandler,
  RequestWithUser,
  successHandler,
} from "../../utils/helper.functions";
import {
  deactivateWallet,
  reactivateWallet,
  fundWalletService,
  getUserWallet,
  getWalletById,
  withdrawFundService,
} from "../services/wallet.service";

import {
  FundWalletDTO,
  ResolveWalletDTO,
  WithdrawFundDTO,
} from "../dtos/wallet.dto";
import {
  IGetUserWalletResponse,
  IResolveWalletResponse,
  IReactivateWalletResponse,
} from "../types/wallet.types";
import { logAction } from "../../logs/services/log.service";
import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../../logs/events/log.event";

export const fundWalletController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const data: FundWalletDTO = req.body;
    const fundedWallet = await fundWalletService(data, req.user);

    return successHandler(res, "Wallet funded successfully", {});
  } catch (error: any) {
    console.log(error);
    return errorHandler(res, error.message || "could not fund wallet");
  }
};
export const withdrawFundsController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const data: WithdrawFundDTO = req.body;
    const fundedWallet = await withdrawFundService(data, req.user);

    return successHandler(res, "Withdrawal successful", {});
  } catch (error: any) {
    console.log(error);
    return errorHandler(res, error.message || "Could not make withdrawal");
  }
};

export const getUserWalletController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const wallet = await getUserWallet(req.user.id);

    const details: IGetUserWalletResponse = {
      _id: wallet.id,
      wallet_id: wallet.wallet_id,
      wallet_name: wallet.wallet_name,
      balance: parseFloat(wallet.balance.toString()),
      status: wallet.status,
    };

    return successHandler(res, "Wallet retrieved successfully", details);
  } catch (error: any) {
    console.log(error);
    return errorHandler(res, error.message || "could not get user wallet");
  }
};

export const resolveWalletController = async (
  req: RequestWithUser,
  res: Response
) => {
  const data: ResolveWalletDTO = req.body;
  try {

    const wallet = await getWalletById(data.walletId);

    const details: IResolveWalletResponse = {
      _id: wallet.id,
      wallet_id: wallet.wallet_id,
      walletName: wallet.wallet_name,
      status: wallet.status,
    };

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "RESOLVE_WALLET_ID",
      user_id: req.user.id,
      details: `Resolved a wallet by wallet Id (${data.walletId})`,
  })

    return successHandler(res, "Wallet resolved successfully", details);
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "RESOLVE_WALLET_ID",
      user_id: req.user.id,
      details: `Resolved a wallet by wallet Id (${data.walletId})`,
      error_message: error.message,
  })
    console.log(error);
    return errorHandler(res, error.message || "could not resolve wallet");
  }
};

export const reactivateWalletController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { walletId } = req.params;
    const wallet = await reactivateWallet(walletId, req.user.id);

    const details: IReactivateWalletResponse = {
      wallet_id: wallet.wallet_id,
      status: wallet.status,
      balance: parseFloat(wallet.balance.toString()),
      last_status_change_date: wallet.last_status_change_date,
    };

    return successHandler(res, "Wallet reactivated successfully", details);
  } catch (error: any) {
    return errorHandler(res, error.message || "Could not reactivate wallet.");
  }
};

export const deactivateWalletController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { walletId } = req.params;
    const wallet = await deactivateWallet(walletId, req.user.id);

    const details = {
      message: wallet.message,
    };

    return successHandler(res, "Wallet successfully deleted", details);
  } catch (error: any) {
    return errorHandler(res, error.message || "Could not delete a wallet");
  }
};
