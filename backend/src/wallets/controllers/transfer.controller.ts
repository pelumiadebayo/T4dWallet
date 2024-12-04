import {
  RequestWithUser,
  successHandler,
  errorHandler,
} from "../../utils/helper.functions";
import { Response } from "express";
import { transferFunds } from "../services/transfers/transfer.service";
import { TransferFundsDTO } from "../dtos/transfer.dto";

export const TransferFundController = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const data: TransferFundsDTO = req.body;

    const fundedWallet = await transferFunds(data, req.user);

    const details = {
      balance: parseFloat(fundedWallet.curr_wallet.balance.toString()),
    };

    return successHandler(res, "Transfer successful", details);
  } catch (error: any) {
    console.log(error);
    return errorHandler(res, error.message);
  }
};
