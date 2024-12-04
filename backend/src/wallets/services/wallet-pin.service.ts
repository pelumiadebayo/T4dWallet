import {
  hashPassword,
  isOTPExpired,
  monthsExpiry,
} from "../../utils/helper.functions";
import { IUser } from "../../auth/models/user.model";
import { Wallet } from "../models/wallet.model";
import bcrypt from "bcrypt";
import { IUpdateWalletPinPayload } from "../types/wallet.types";
import mongoose from "mongoose";
import { logAction } from "../../logs/services/log.service";
import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../../logs/events/log.event";

/**
 * Sets a new PIN for the user's wallet. The new PIN is hashed before being saved.
 * If the wallet PIN has already been changed previously, an error will be thrown.
 *
 * @param {string} newPin - The new PIN to be set for the user's wallet. It will be hashed before storing.
 * @param {IUser} user - The user object, which contains the user's ID and other details.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the PIN was successfully updated, otherwise an error is thrown.
 * @throws {Error} If the wallet PIN cannot be set, or if the wallet PIN has already been changed previously.
 *
 * @example
 * const isPinSet = await setWalletPin('123456', user);
 * console.log(isPinSet); // true if the PIN was successfully set
 */
export const setWalletPin = async (
  newPin: string,
  user: IUser
): Promise<boolean> => {
  try {
    const wallet = await Wallet.findOne({ user: user._id }).orFail();

    const complexPin = await hashPassword(newPin);

    if (wallet.wallet_pin_changed) {
      throw new Error("Transaction PIN already set");
    }

    wallet.wallet_pin = complexPin;
    wallet.wallet_pin_changed = true;
    wallet.wallet_pin_next_change = monthsExpiry(3);

    await wallet.save();

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "SET_WALLET_PIN",
      user_id: user.id,
      details: `Set wallet pin`,
  })

    return true;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "SET_WALLET_PIN",
      user_id: user.id,
      details: `Set wallet pin`,
      error_message: error.message,
  })
    // console.log("Could not set wallet pin:", error);
    throw new Error(error.message || "Could not set wallet pin");
  }
};

/**
 * Changes the wallet PIN for the user. The new PIN is hashed and stored.
 * If the wallet PIN has already been changed and the cooldown period has not expired,
 * an error will be thrown preventing the change.
 *
 * @param {string} newPin - The new PIN to set for the user's wallet. It will be hashed before saving.
 * @param {IUser} user - The user object, which contains the user's ID and other details.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the PIN was successfully changed, otherwise an error is thrown.
 * @throws {Error} If the wallet PIN cannot be changed or if the cooldown period is still active.
 *
 * @example
 * const isPinChanged = await changeWalletPin('987654', user);
 * console.log(isPinChanged); // true if the PIN was successfully changed
 */
export const changeWalletPin = async (
  payload: IUpdateWalletPinPayload,
  user: IUser
): Promise<boolean> => {
  try {
    const wallet = await Wallet.findOne({ user: user._id }).orFail();

    if (!wallet.wallet_pin_changed) {
      throw new Error("User has not set pin for wallet");
    }

    if (
      wallet.wallet_pin_changed &&
      !isOTPExpired(wallet.wallet_pin_next_change)
    ) {
      throw new Error("you cannot change your pin at this time");
    }

    const result = await bcrypt.compare(payload.oldPin, wallet.wallet_pin);

    if (!result) {
      throw new Error("Invalid PIN");
    }

    const complexPin = await hashPassword(payload.newPin);

    wallet.wallet_pin = complexPin;
    wallet.wallet_pin_changed = true;
    wallet.wallet_pin_next_change = monthsExpiry(3);

    await wallet.save();

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "CHANGE_WALLET_PIN",
      user_id: user.id,
      details: `Change wallet pin`,
  })

    return true;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "CHANGE_WALLET_PIN",
      user_id: user.id,
      details: `Change wallet pin`,
  })
    console.log("Could not set wallet pin:", error);
    throw new Error(error.message || "Could not set wallet pin");
  }
};

export const validateWalletPin = async (
  walletPin: string,
  user: IUser,
  session?: mongoose.ClientSession
): Promise<boolean> => {
  try {
    const wallet = await Wallet.findOne({ user: user._id }).session(session).orFail();

    if (wallet.wallet_pin === "") {
      throw new Error("User has not set pin for wallet");
    }

    const result = await bcrypt.compare(walletPin, wallet.wallet_pin);    

    // if (!result) {
    //  return false
    // }
    if (!result) {
      throw new Error("Wrong PIN");
    }

    return true;
  } catch (error: any) {
    console.log("Could not validate wallet pin:", error);
    throw new Error(error.message || false);
  }
};
