import { plainToInstance } from "class-transformer";
import { SearchTransactionDto } from "../dtos/transacton.dto";
import { ICreateTransactionInput } from "../interfaces/transaction.interface";
import { ITransaction, Transaction } from "../models/transaction.model"
import { validateOrReject } from "class-validator";
import mongoose from "mongoose";
import { paginate } from "../../utils/paginate";


/**
 * Creates a new transaction in the database.
 *
 * @param payload - The data required to create a transaction, including details like amount, transaction type, and user information.
 * @param options - Optional session object for transaction atomicity.
 * @returns The newly created transaction document.
 * @throws An error if the transaction creation fails.
 */
export const createTransaction = async (
  payload: ICreateTransactionInput,
  options?: { session: mongoose.ClientSession }
): Promise<ITransaction> => {
  try {
    const transaction = new Transaction({
      transaction_type: payload.transaction_type,
      amount: payload.amount,
      charge: payload.charge,
      currency: payload.currency,
      transaction_category: payload.transaction_category,
      transaction_status: payload.transaction_status,
      balance_before: payload.balance_before,
      balance_after: payload.balance_after,
      description: payload.description,
      transaction_reference: payload.transaction_reference,
      wallet: payload.wallet,
      user: payload.user,
    });

    return await transaction.save();

     } catch (error) {
          console.log('could not create transaction', error);
          
          throw new Error('could not create transaction')
     }
}

// Get all the transactions from a single wallet
export const getAllTransactionsByWallet = async(walletId: string): Promise<ITransaction[]> => {
     try {
          const wallet_id = new mongoose.Types.ObjectId(walletId);
          const transactions = await Transaction.find({ wallet: wallet_id}).exec();
     
          if (!transactions) throw new Error("Transaction does not exist");
     
          return transactions;
   
     } catch (error) {
          console.log('Could not get transactions:', error);
          throw new Error('Could not get transactions');
     }
}
   
// Get all the transactions made by a user
export const getAllTransactionsByUser = async (
     userId: string,
     page: number = 1,
     limit: number = 10
   ): Promise<{
     transactions: ITransaction[];
     totalPages: number;
     currentPage: number;
   }> => {
     try {
          if (page < 1 || limit < 1) {
               throw new Error("Page and limit must be positive integers.");
          }
     
          const userObjectId = new mongoose.Types.ObjectId(userId);
     
          const { data, totalPages } = await paginate<ITransaction>(Transaction, { userId: userObjectId }, { page, limit });
   
          return {
               transactions: data,
               totalPages,
               currentPage: page,
          };

     } catch (error: any) {
          console.error(`Error fetching transactions for user ${userId}:`, error.message);
          throw new Error(`Error fetching transactions: ${error.message}`);
     }
};

// Get a single transaction by Id
export const getTransactionById = async(transactionId: string): Promise<ITransaction> => {
     try {
          const transaction = await Transaction.findById({_id: transactionId});
     
          if (!transaction) throw new Error("Transaction not found");
     
          return transaction;
   
     } catch (error) {
          // console.log('Could not get transaction:', error);
          throw new Error('Could not get transaction');
     }
}

// Search transaction by different fields
export const searchTransactionsService = async(
     userId: string,
     searchDto: SearchTransactionDto
): Promise<{transactions: ITransaction[]; totalPages: number; currentPages: number}> => {
     try {
          const searchParams = plainToInstance(SearchTransactionDto, searchDto);
          await validateOrReject(searchParams);

          const {
               transaction_type,
               minAmount,
               maxAmount,
               currency,
               transaction_status,
               startDate,
               endDate,
               page = 1,
               limit = 10,
          } = searchParams;

          const query: any = { user: userId };

          if (transaction_type) query.transaction_type = transaction_type;
          if (minAmount) query.amount = { ...query.amount, $gte: minAmount };
          if (maxAmount) query.amount = { ...query.amount, $lte: maxAmount };
          if (currency) query.currency = currency;
          if (transaction_status) query.transaction_status = transaction_status;
          if (startDate || endDate) {
               query.created_at = {};
               if (startDate) query.created_at.$gte = new Date(startDate);
               if (endDate) query.created_at.$lte = new Date(endDate);
          }

          // Pagination
          const skip = (page - 1) * limit;
          const [transactions, totalCount] = await Promise.all([
               Transaction.find(query)
                 .sort({ created_at: -1 })
                 .skip(skip)
                 .limit(limit),
               Transaction.countDocuments(query),
          ]);
         
          const totalPages = Math.ceil(totalCount / limit);

          return { transactions, totalPages, currentPages: page};

     } catch (error) {
          console.error("Error searching transactions:", error);
          throw new Error("Invalid search parameter");
     }
}

// Filter transaction by date
export const getTransactionByDate = async(
     userId: string,
     startDate?: string,
     endDate?: string,
     page: number = 1,
     limit: number = 10
): Promise<{transactions: ITransaction[]; totalPages: number; currentPages: number}> => {
     try {
          const query: any = { user: userId };
          
          if (startDate || endDate) {
               query.created_at = {};
               if (startDate) query.created_at.$gte = new Date(startDate);
               if (endDate) query.created_at.$lte = new Date(endDate);
          }

          const skip = (page - 1) * limit;
          const [transactions, totalCount] = await Promise.all([
               Transaction.find(query)
                 .sort({ created_at: -1 })
                 .skip(skip)
                 .limit(limit),
               Transaction.countDocuments(query)
          ]);

          if (!transactions || transactions.length === 0) {
               throw new Error("No transactions found for the given filters.");
          }

          const totalPages = Math.ceil(totalCount / limit);

          return { transactions, totalPages, currentPages: page };

     } catch (error) {
          console.log("Error fetching transactions by dat", error);
          throw new Error("Error fetching transcations");
     }
}
