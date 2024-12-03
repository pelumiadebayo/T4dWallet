import { Router } from "express";
import { UserController } from "../users/controller/user-controller";
import { imageUpload } from "../utils/multer";
import { authorizeUser } from "../midllewares/auth-middleware";
import { validateBody } from "../midllewares/validate";
import {
  FundWalletDTO,
  ResolveWalletDTO,
  WithdrawFundDTO,
} from "./dtos/wallet.dto";
import {
  deactivateWalletController,
  reactivateWalletController,
  fundWalletController,
  getUserWalletController,
  resolveWalletController,
  withdrawFundsController,
} from "./controllers/wallet.controller";
import { TransferFundController } from "./controllers/transfer.controller";
import { TransferFundsDTO } from "./dtos/transfer.dto";
import { ChangeWalletPinDTO, SetWalletPinDTO } from "./dtos/wallet-pin.dto";
import {
  changeWalletPinController,
  setWalletPinController,
  validateWalletPinController,
} from "./controllers/wallet-pin.controller";
import { changeWalletPin } from "./services/wallet-pin.service";
import { getAllTransactionsByWalletController } from "../transactions/controllers/transaction.controller";


const router = Router();

router.post(
  "/fund",
  validateBody(FundWalletDTO),
  authorizeUser,
  fundWalletController as any
);
router.post(
  "/withdraw",
  validateBody(WithdrawFundDTO),
  authorizeUser,
  withdrawFundsController as any
);
router.post(
  "/resolve",
  validateBody(ResolveWalletDTO),
  authorizeUser,
  resolveWalletController as any
);
router.post(
  "/transfer",
  validateBody(TransferFundsDTO),
  authorizeUser,
  TransferFundController as any
);
router.get("", authorizeUser, getUserWalletController as any);
router.get("/wallet-transaction", authorizeUser, getAllTransactionsByWalletController as any);
router.patch("/reactivate/:walletId", authorizeUser, reactivateWalletController as any);
router.delete("/deactivate/:walletId", authorizeUser, deactivateWalletController as any);

// wallet pin
router.post(
  "/pin/set",
  validateBody(SetWalletPinDTO),
  authorizeUser,
  setWalletPinController as any
);
router.post(
  "/pin/update",
  validateBody(ChangeWalletPinDTO),
  authorizeUser,
  changeWalletPinController as any
);
router.post(
  "/pin/validate",
  validateBody(SetWalletPinDTO),
  authorizeUser,
  validateWalletPinController as any
);

export default router;
