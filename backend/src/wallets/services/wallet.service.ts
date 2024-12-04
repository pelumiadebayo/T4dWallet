import { IUser } from "../../auth/models/user.model";
import {
  IWallet,
  IWalletStatusUpdateOptions,
  Wallet,
} from "../models/wallet.model";
import {
  cloneObj,
  formatNumberWithComma,
  formatTransactionDate,
  generateULIDForEntity,
  generateWalletId,
} from "../../utils/helper.functions";
import mongoose from "mongoose";
import { appEmitter } from "../../globals/events";
import { WALLET_EVENTS } from "../events/wallets.events";
import {
  IFundWalletPayload,
  IWalletStates,
  IWithdrawFundPayload,
} from "../types/wallet.types";
import { createTransaction } from "../../transactions/services/transaction.service";
import { TransactionCategory } from "../../transactions/interfaces/transaction.interface";
import { IMailData } from "../../utils/emails/types";
import { sendEMail } from "../../utils/emails/send-email";
import { Logs } from "../../logs/models/log.model";
import { validateWalletPin } from "./wallet-pin.service";
import { logAction } from "../../logs/services/log.service";
import { LOG_EVENTS } from "../../logs/events/log.event";

/**
 * Creates a new wallet for the user if it doesn't already exist. If the user already has a wallet,
 * the existing wallet will be returned.
 *
 * @param {IUser} user - The user for whom the wallet is to be created. This contains the user's details.
 * @returns {Promise<IWallet>} A promise that resolves to the created or existing wallet of the user.
 * @throws {Error} If an error occurs during wallet creation.
 *
 */
export const createWalletService = async (user: IUser): Promise<IWallet> => {
  try {
    const walletExists = await Wallet.findOne().where({ user: user._id });

    if (!!walletExists) {
      console.log("user already has a wallet");
      throw new Error('user already has a wallet')
      // return walletExists;
    }

    const fullName = `${user.first_name} ${user.last_name}`;
    const walletName = `T4DWALLET/${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;

    const newWallet = await Wallet.create({
      wallet_id: await generateWalletId(),
      balance: mongoose.Types.Decimal128.fromString("0.00"),
      owner_fullname: fullName,
      wallet_name: walletName,
      wallet_pin_changed: false,
      wallet_pin_next_change: new Date(),
      wallet_pin: "",
      status: "ACTIVE",
      last_transaction_date: new Date(),
      last_status_change_date: new Date(),
      user: user._id,
    });

    return newWallet;
  } catch (error: any) {
    // console.log("could not create new wallet", error);
    throw new Error(error.message || "could not create new wallet");
  }
};

appEmitter.on(WALLET_EVENTS.USER_CONFIRMED_OTP, async (user: IUser) => {
  try {
    const wallet = await createWalletService(user);
    
    if (wallet) {
      console.log(`Creating wallet for user ${user._id}`);
      appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
        status: "success",
        action: "CREATE_WALLET",
        user_id: user.id,
        details: "Wallet account created for user",
      });
    }
  } catch (error: any) {
    await logAction({
      status: "failed",
      action: "CREATE_WALLET",
      user_id: user.id,
      details: "Wallet account created for user",
      error_message: error.message,
    });
    console.error(`Failed to create wallet for user ${user._id}:`, error);
  }
});

/**
 * Debits a specified amount from the user's wallet. This function ensures that the user has sufficient balance
 * before performing the debit operation and returns the updated wallet state.
 *
 * @param {IUser} user - The user whose wallet is to be debited.
 * @param {number} amount - The amount to be debited from the user's wallet.
 * @param {mongoose.ClientSession} [session] - Optional Mongoose session for transaction management.
 * @returns {Promise<IWalletStates>} A promise that resolves to the previous and current wallet state.
 * @throws {Error} If the user has insufficient balance or an error occurs during the debit operation.
 *
 */
export const debitWalletService = async (
  user: IUser,
  amount: number,
  session?: mongoose.ClientSession
): Promise<IWalletStates> => {
  try {
    const wallet = await Wallet.findOne({ user: user._id })
      .session(session)
      .orFail();

    // Clone the wallet before debiting
    const previousWallet = cloneObj(wallet);

    // Convert wallet balance (Decimal128) to number for comparison
    const walletBalance = parseFloat(wallet.balance.toString());

    // Check if the wallet has sufficient balance
    if (walletBalance < amount) {
      throw new Error("Insufficient balance");
    }

    // Debit the wallet by subtracting the amount
    const newBalance = walletBalance - amount;

    // Ensure balance is a valid Decimal128
    wallet.balance = mongoose.Types.Decimal128.fromString(
      newBalance.toFixed(2)
    );

    // Save the updated wallet within the transaction session
    const updatedWallet = await wallet.save({ session });

    return {
      prev_wallet: previousWallet,
      curr_wallet: updatedWallet,
    };
  } catch (error: any) {
    console.log("Could not debit wallet:", error);
    throw new Error(error.message || "Could not debit wallet");
  }
};

/**
 * Credits a specified amount to the user's wallet. This function updates the user's wallet balance accordingly
 * and returns the updated wallet state.
 *
 * @param {string} userId - The ID of the user whose wallet is to be credited.
 * @param {number} amount - The amount to be credited to the user's wallet.
 * @param {mongoose.ClientSession} [session] - Optional Mongoose session for transaction management.
 * @returns {Promise<IWalletStates>} A promise that resolves to the previous and current wallet state.
 * @throws {Error} If an error occurs during the credit operation.
 *
 */
export const creditWalletService = async (
  userId: string,
  amount: number,
  session?: mongoose.ClientSession
): Promise<IWalletStates> => {
  try {
    const wallet = await Wallet.findOne({ user: userId })
      .session(session)
      .orFail();

    // Clone the wallet before debiting
    const previousWallet = cloneObj(wallet);

    // Convert wallet balance (Decimal128) to number for comparison
    const walletBalance = parseFloat(wallet.balance.toString());

    // Credit the wallet by adding the amount
    const newBalance = walletBalance + amount;

    // Ensure balance is a valid Decimal128
    wallet.balance = mongoose.Types.Decimal128.fromString(
      newBalance.toFixed(2)
    );

    // Save the updated wallet within the transaction session
    const updatedWallet = await wallet.save({ session });

    return {
      prev_wallet: previousWallet,
      curr_wallet: updatedWallet,
    };
  } catch (error: any) {
    console.log("Could not credit wallet:", error);
    throw new Error(error.message || "Could not credit wallet");
  }
};

/**
 * Funds the user's wallet with the specified amount. The wallet is credited with the provided amount,
 * and a transaction record is created. This function uses a transaction session to ensure atomicity.
 *
 * @param {IFundWalletPayload} payload - The details of the fund transaction, including the amount.
 * @param {IUser} user - The user whose wallet is to be funded.
 * @returns {Promise<IWallet>} A promise that resolves to the updated wallet of the user after funding.
 * @throws {Error} If an error occurs during the funding process or wallet update.
 *
 */
export const fundWalletService = async (
  payload: IFundWalletPayload,
  user: IUser
): Promise<IWallet> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const creditUser = await creditWalletService(
      user.id,
      payload.amount,
      session
    );

    // Log the transaction
    await createTransaction(
      {
        transaction_category: TransactionCategory.WALLET_FUNDING,
        transaction_type: "CREDIT",
        transaction_reference: generateULIDForEntity("TRANS-"),
        balance_before: creditUser.prev_wallet.balance,
        balance_after: creditUser.curr_wallet.balance,
        charge: 0,
        amount: payload.amount,
        description: payload.description || "Wallet funded successfully",
        wallet: creditUser.curr_wallet.id,
        user: user.id,
        currency: "NGN",
        transaction_status: "Successful",
      },
      { session }
    );

    const transactionDate = formatTransactionDate(new Date());

    appEmitter.emit(WALLET_EVENTS.WALLET_FUNDED, {
      sender: user,
      amount: payload.amount,
      balance: parseFloat(creditUser.curr_wallet.balance.toString()),
    });

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "FUND_WALLET",
      user_id: user.id,
      details: `Deposited ${payload.amount} into wallet`,
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return creditUser.curr_wallet;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "FUND_WALLET",
      user_id: user.id,
      details: `Deposited ${payload.amount} into wallet`,
      error_message: error.message,
    });
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Could not fund wallet:", error);
    throw new Error(error.message || "Could not fund wallet");
  }
};

/**
 * Withdraws a specified amount from the user's wallet. The wallet is debited with the provided amount,
 * and a transaction record is created. This function uses a transaction session to ensure atomicity.
 *
 * @param {IWithdrawFundPayload} payload - The details of the withdrawal transaction, including the amount.
 * @param {IUser} user - The user whose wallet is to be debited.
 * @returns {Promise<IWallet>} A promise that resolves to the updated wallet of the user after withdrawal.
 * @throws {Error} If an error occurs during the withdrawal process or wallet update.
 *
 */
export const withdrawFundService = async (
  payload: IWithdrawFundPayload,
  user: IUser
): Promise<IWallet> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // validate wallet pin

    const validatePin = await validateWalletPin(
      payload.wallet_pin,
      user,
      session
    );

    if (!validatePin) {
      throw new Error("Incorrect pin");
    }
    const debitUser = await debitWalletService(user, payload.amount, session);

    // Log the transaction
    await createTransaction(
      {
        transaction_category: TransactionCategory.WITHDRAWAL,
        transaction_type: "DEBIT",
        transaction_reference: generateULIDForEntity("TRANS-"),
        balance_before: debitUser.prev_wallet.balance,
        balance_after: debitUser.curr_wallet.balance,
        charge: 0,
        amount: payload.amount,
        description: `Withdrawal of ${payload.amount} from user's wallet successfully`,
        wallet: debitUser.curr_wallet.id,
        user: user.id,
        currency: "NGN",
        transaction_status: "Successful",
      },
      { session }
    );

    const transactionDate = formatTransactionDate(new Date());

    appEmitter.emit(WALLET_EVENTS.WITHDRAWAL, {
      sender: user,
      amount: payload.amount,
      balance: parseFloat(debitUser.curr_wallet.balance.toString()),
    });

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "DEBIT_WALLET",
      user_id: user.id,
      details: `Withdrew ${payload.amount} from wallet`,
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return debitUser.curr_wallet;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "DEBIT_WALLET",
      user_id: user.id,
      details: `Withdrew ${payload.amount} from wallet`,
      error_message: error.message,
    });
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("could not debit wallet:", error);
    throw new Error(error.message || "could not debit wallet");
  }
};

/**
 * Retrieves the wallet associated with the specified user ID.
 *
 * @param {string} userId - The ID of the user whose wallet is to be retrieved.
 * @returns {Promise<IWallet>} A promise that resolves to the user's wallet.
 * @throws {Error} If no wallet is found for the user.
 *
 */
export const getUserWallet = async (userId: string): Promise<IWallet> => {
  try {
    const wallet = await Wallet.findOne().where({ user: userId }).exec();

    if (!wallet) throw new Error("User does not have a wallet");

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "GET_WALLET",
      user_id: userId,
      details: `Retrieved wallet details`,
    });
    return wallet;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "GET_WALLET",
      user_id: userId,
      details: `Retrieved wallet details`,
      error_message: error.message,
    });

    console.log("Could not get user wallet:", error);
    throw new Error(error.message || "Could not get user wallet");
  }
};

/**
 * Retrieves a wallet by its unique wallet ID.
 *
 * @param {string} walletId - The wallet ID to search for.
 * @returns {Promise<IWallet>} A promise that resolves to the wallet with the given wallet ID.
 * @throws {Error} If no wallet is found with the specified wallet ID.
 *
 */
export const getWalletById = async (walletId: string): Promise<IWallet> => {
  try {
    const wallet = await Wallet.findOne({ wallet_id: walletId }).exec();

    if (!wallet) throw new Error("Wallet does not exist");

    return wallet;
  } catch (error: any) {
    console.log("Could not resolve wallet:", error);
    throw new Error(error.message || "Could not resolve wallet");
  }
};

// export const updateWalletStatuses = async (
//   options: Partial<IWalletStatusUpdateOptions> = {}
// ): Promise<void> => {
//   const {
//     inactiveDays = process.env.INACTIVE_DAYS,
//     suspensionDays = process.env.SUSPENSION_DAYS,
//   } = options;

//   const now = new Date();

//   const wallets = await Wallet.aggregate([
//     {
//       $match: {
//         balance: { $eq: 0 }, // Wallet with zero balance
//         status: { $in: ["ACTIVE", "INACTIVE"] }, // Only update active or inactive wallets
//       },
//     },
//     {
//       $addFields: {
//         daysSinceLastActivity: {
//           $divide: [
//             { $subtract: [now, "$last_transaction_date"] },
//             1000 * 60 * 60 * 24,
//           ],
//         },
//       },
//     },
//     {
//       $match: {
//         $or: [
//           // Wallets to be marked inactive
//           {
//             status: "ACTIVE",
//             daysSinceLastActivity: { $gte: inactiveDays },
//           },
//           // Wallets to be suspended
//           {
//             status: "INACTIVE",
//             daysSinceLastActivity: { $gte: suspensionDays },
//           },
//         ],
//       },
//     },
//   ]);

//   const system_action = process.env.SYSTEM_ACTION;
//   const SYSTEM_ACTION = new mongoose.Types.ObjectId(system_action);
//   // Perform updates with bulk operations
//   if (wallets.length > 0) {
//     const session = await mongoose.startSession();

//     try {
//       await session.withTransaction(async () => {
//         // Bulk update wallets
//         const bulkWalletUpdates = wallets.map((wallet) => ({
//           updateOne: {
//             filter: { _id: wallet._id },
//             update: {
//               $set: {
//                 status:
//                   wallet.daysSinceLastActivity >= inactiveDays
//                     ? wallet.status === "ACTIVE"
//                       ? "INACTIVE"
//                       : "SUSPENDED"
//                     : wallet.status,
//                 last_status_change_date: now,
//               },
//             },
//           },
//         }));

//         await Wallet.bulkWrite(bulkWalletUpdates, { session });

//         // Create audit logs
//         const Logss = wallets.map((wallet) => ({
//           action:
//             wallet.daysSinceLastActivity >= inactiveDays
//               ? wallet.status === "ACTIVE"
//                 ? "INACTIVE"
//                 : "SUSPEND"
//               : "",
//           wallet: wallet._id,
//           performedBy: SYSTEM_ACTION, // System action
//           reason:
//             wallet.daysSinceLastActivity >= inactiveDays
//               ? wallet.status === "ACTIVE"
//                 ? `No activity for ${inactiveDays} days`
//                 : `No activity for ${suspensionDays} days`
//               : "",
//           status: "success",
//           created_at: now,
//         }));

//         await Logs.create(Logss);
//       });
//     } catch (error: any) {
//       const Logss = wallets.map((wallet) => ({
//         action:
//           wallet.daysSinceLastActivity >= inactiveDays
//             ? wallet.status === "ACTIVE"
//               ? "INACTIVE"
//               : "SUSPEND"
//             : "",
//         wallet: wallet._id,
//         performedBy: SYSTEM_ACTION, // System action
//         reason:
//           wallet.daysSinceLastActivity >= inactiveDays
//             ? wallet.status === "ACTIVE"
//               ? `No activity for ${inactiveDays} days`
//               : `No activity for ${suspensionDays} days`
//             : "",
//         status: "failed",
//         created_at: now,
//       }));
//       await Logs.create(Logss);
//       throw new Error(error.message || "Error deleting wallet.");
//     } finally {
//       session.endSession();
//     }
//   }
// };

/**
 * Updates wallet statuses based on inactivity thresholds.
 *
 * Identifies wallets with zero balance and updates their
 * status to "INACTIVE" or "SUSPENDED"
 * based on inactivity thresholds (`inactiveDays` or `suspensionDays`). Logs all actions.
 *
 * @param {Partial<IWalletStatusUpdateOptions>} [options={}] - Options for status updates.
 * @param {number} [options.inactiveDays=process.env.INACTIVE_DAYS] - Days of inactivity to mark as "INACTIVE".
 * @param {number} [options.suspensionDays=process.env.SUSPENSION_DAYS] - Days of inactivity to mark as "SUSPENDED".
 * @returns {Promise<void>} Resolves when updates and logs are complete.
 *
 * @throws {Error} If a transaction or logging error occurs.
 */
export const updateWalletStatuses = async (
  options: Partial<IWalletStatusUpdateOptions> = {}
): Promise<void> => {
  const {
    inactiveDays = Number(process.env.INACTIVE_DAYS),
    suspensionDays = Number(process.env.SUSPENSION_DAYS),
  } = options;

  const now = new Date();

  const wallets = await Wallet.aggregate([
    {
      $match: {
        balance: { $eq: 0 },
        status: { $in: ["ACTIVE", "INACTIVE"] },
      },
    },
    {
      $addFields: {
        daysSinceLastActivity: {
          $divide: [
            { $subtract: [now, "$last_transaction_date"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $match: {
        $or: [
          {
            status: "ACTIVE",
            daysSinceLastActivity: { $gte: inactiveDays },
          },
          {
            status: "INACTIVE",
            daysSinceLastActivity: { $gte: suspensionDays },
          },
        ],
      },
    },
  ]);

  const SYSTEM_ACTION = new mongoose.Types.ObjectId(process.env.SYSTEM_ACTION);

  if (wallets.length > 0) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const bulkUpdates = wallets.map((wallet) => {
          const newStatus =
            wallet.daysSinceLastActivity >= inactiveDays
              ? wallet.status === "ACTIVE"
                ? "INACTIVE"
                : "SUSPENDED"
              : wallet.status;

          return {
            updateOne: {
              filter: { _id: wallet._id },
              update: {
                $set: {
                  status: newStatus,
                  last_status_change_date: now,
                },
              },
            },
          };
        });

        await Wallet.bulkWrite(bulkUpdates, { session });

        await Promise.all(
          wallets.map((wallet) => {
            const newStatus =
              wallet.daysSinceLastActivity >= inactiveDays
                ? wallet.status === "ACTIVE"
                  ? "INACTIVE"
                  : "SUSPENDED"
                : "";

            appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
              status: "success",
              action: "WALLET_STATUS_UPDATED",
              name: SYSTEM_ACTION.toString(),
              details: `Wallet ${wallet.wallet_id} was updated to ${newStatus}`,
            });
          })
        );
      });
    } catch (error: any) {
      await Promise.all(
        wallets.map((wallet) => {
          const newStatus =
            wallet.daysSinceLastActivity >= inactiveDays
              ? wallet.status === "ACTIVE"
                ? "INACTIVE"
                : "SUSPENDED"
              : "";

          appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
            status: "failed",
            action: "WALLET_STATUS_UPDATED",
            user_id: SYSTEM_ACTION.toString(),
            details: `Wallet ${wallet.wallet_id} was updated to ${newStatus}`,
            error_message: error.message,
          });
        })
      );
      throw new Error(error.message || "Error updating wallets.");
    } finally {
      session.endSession();
    }
  }
};

/**
 * Deactivates a wallet by marking its status as "DELETED".
 *
 * Ensures the wallet has a zero balance before deactivation.
 * Logs the operation status.
 *
 * @param {string} walletId - The ID of the wallet to deactivate.
 * @param {string} userId - The ID of the user performing the action.
 * @returns {Promise<{ message: string }>} A success message upon completion.
 *
 * @throws {Error} If the wallet does not exist, has a
 * non-zero balance, or another error occurs.
 */
export const deactivateWallet = async (
  walletId: string,
  userId: string
): Promise<{ message: string }> => {
  try {
    const wallet = await Wallet.findOne({ wallet_id: walletId }).exec();
    if (!wallet) throw new Error("No wallet found");

    if (parseFloat(wallet.balance.toString()) > 0) {
      throw new Error("Cannot delete wallet with non-zero balance");
    }

    await Wallet.findByIdAndUpdate({ walletId }, { status: "DELETED" });

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "DEACTIVATE_WALLET",
      user_id: userId,
      details: `Wallet ${walletId} deleted`,
    });

    return { message: "Wallet successfully deleted" };
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "DEACTIVATE_WALLET",
      user_id: userId,
      details: `Wallet ${walletId} deleted`,
      error_message: error.message,
    });

    throw new Error(error.message || "Error deleting wallet.");
  }
};

/**
 * Reactivates a wallet by updating its status to "ACTIVE".
 *
 * Ensures the wallet exists, is not already active, and has a
 * positive balance before reactivation. Logs the operation status.
 *
 * @param {string} walletId - The ID of the wallet to reactivate.
 * @param {string} userId - The ID of the user performing the action.
 * @returns {Promise<IWallet>} The updated wallet object.
 *
 * @throws {Error} If the wallet does not exist, is already active, has a non-positive balance, or another error occurs.
 */
export const reactivateWallet = async (
  walletId: string,
  userId: string
): Promise<IWallet> => {
  try {
    const wallet = await Wallet.findOne({ wallet_id: walletId }).exec();

    if (!wallet) throw new Error("Wallet not found");

    if (wallet.status === "ACTIVE") throw new Error("Wallet is already active");

    if (parseFloat(wallet.balance.toString()) <= 0)
      throw new Error("Wallet has to be funded before you can reactivate");

    // Update wallet status
    const updateWallet = await Wallet.findOneAndUpdate(
      { wallet_id: walletId },
      {
        status: "ACTIVE",
        last_status_change_date: new Date(),
      },
      { new: true }
    );

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "REACTIVATE_WALLET",
      user_id: userId,
      details: `Wallet ${walletId} reactivated`,
    });

    return updateWallet;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "REACTIVATE_WALLET",
      user_id: userId,
      details: `Wallet ${walletId} reactivated`,
      error_message: error.message,
    });
    throw new Error("Error reactivating wallet.");
  }
};

appEmitter.on(WALLET_EVENTS.WALLET_FUNDED, async (data) => {
  try {
    const mailData: IMailData = {
      templateKey: "fundEmail",
      email: data.sender.email,
      placeholders: {
        firstname: data.sender.first_name,
        amount: formatNumberWithComma(data.amount),
        Balance: formatNumberWithComma(data.balance),
      },
      subject: "Funding Successful",
    };

    await sendEMail(mailData);
  } catch (error) {
    console.error("Error sending emails:", error);
  }
});

appEmitter.on(WALLET_EVENTS.WITHDRAWAL, async (data) => {
  try {
    const mailData: IMailData = {
      templateKey: "debitEmail",
      email: data.sender.email,
      placeholders: {
        firstname: data.sender.first_name,
        amount: formatNumberWithComma(data.amount),
        Balance: formatNumberWithComma(data.balance),
      },
      subject: "Withdrawal Successful",
    };

    await sendEMail(mailData);
  } catch (error) {
    console.error("Error sending emails:", error);
  }
});
