import { Response } from "express";
import { errorHandler, RequestWithUser, successHandler } from "../../utils/helper.functions";
import { getAllTransactionsByUser, getAllTransactionsByWallet, getTransactionByDate, getTransactionById, searchTransactionsService } from "../services/transaction.service";
import { SearchTransactionDto } from "../dtos/transacton.dto";
import { getUserWallet } from "../../wallets/services/wallet.service";
import { Transaction } from "../models/transaction.model";


export const getAllTransactionsByWalletController = async(req: RequestWithUser, res: Response) => {
    try {
        const wallet = req.user.id;

        const transactions = await getAllTransactionsByWallet(wallet.wallet_id);

        return successHandler(res, "Transactions retrieved successfully", transactions);

    } catch (error: any) {
        return errorHandler(res, error.message || "Could not get transactions");
    }
}

export const getAllTransactionsByUserController = async(req: RequestWithUser, res: Response) => {
    try {
        const userId  = req.query.user as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (!userId) {
            return errorHandler(res, "User not found");
        }

        const transactions = await getAllTransactionsByUser(
            userId,
            page,
            limit
        );

        return successHandler(res, "Transactions retrieved successfully", {
            transactions,
            
        });
    } catch (error: any) {
        console.error(error)
        return errorHandler(res, error.message || "Could not retrieve transactions");
    };
}

export const getTransactionByIdController = async(req: RequestWithUser, res: Response) => {
    try {
        const transactionId = req.params.transactionId;

        const transaction = await getTransactionById(transactionId);

        return successHandler(res, "Transaction retrieved successfully", transaction);

    } catch (error: any) {
        return errorHandler(res, error.message || "Could not retrieve transaction");
    };
}

export const searchTransactionsController = async(req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user.id;

        const searchDto: SearchTransactionDto = {
            transaction_type: req.query.transaction_type as "CREDIT" | "DEBIT",
            minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
            maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
            currency: req.query.currency as string,
            transaction_status: req.query.transaction_status as "SUCCESSFUL" | "PENDING" | "FAILED",
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10
        };

        const { transactions, totalPages, currentPages } = await searchTransactionsService(
            userId,
            searchDto
        );

        return successHandler(res, "Transactions retrieved successfully", {
            transactions,
            pagination: {
                totalPages,
                currentPage: currentPages,
                limit: searchDto.limit
            }
        });
        
    } catch (error: any) {
        return errorHandler(res, error.message || "Invalid search parameter.");
    }
}

export const getTransactionByDateController = async(req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user.id;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const { transactions, totalPages, currentPages } = await getTransactionByDate(
            userId,
            startDate,
            endDate,
            page,
            limit
        );

        return successHandler(res, "Transactions retrieved successfully", {
            transactions,
            pagination: {
                totalPages,
                currentPage: currentPages,
                limit
            }
        });

    } catch (error: any) {
        return errorHandler(res, error.message || "Invalid search parameter.");
    }
}