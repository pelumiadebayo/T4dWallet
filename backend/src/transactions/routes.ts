import { Router } from "express";
import { authorizeUser } from "../midllewares/auth-middleware";
import { getAllTransactionsByUserController, getTransactionByIdController, searchTransactionsController } from "./controllers/transaction.controller";
import { validateBody } from "../midllewares/validate";
import { FilterByDateDto, SearchTransactionDto } from "./dtos/transacton.dto";
import { getTransactionByDate } from "./services/transaction.service";

const router = Router();

router.get("/:transactionId", authorizeUser, getTransactionByIdController as any);
router.get("/user-transaction", authorizeUser, getAllTransactionsByUserController as any);
router.get("/search", validateBody(SearchTransactionDto), authorizeUser, searchTransactionsController as any);
router.get("/filter-by-date", validateBody(FilterByDateDto), authorizeUser, getTransactionByDate as any);

export default router;