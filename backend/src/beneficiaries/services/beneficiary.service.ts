import { getWalletById } from "../../wallets/services/wallet.service";
import { IUser } from "../../auth/models/user.model";
import { Beneficiary, IBeneficiary } from "../models/beneficiary.model";
import { IBeneficiaryPayload } from "../types/beneficiary.types";
import { MAX_NUMBER_OF_USER_BENEFICIARIES } from "../constants";
import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../../logs/events/log.event";

/**
 * Save a new beneficiary for a user.
 *
 * @param payload - The data required to create a new beneficiary.
 * @param user - The authenticated user attempting to save the beneficiary.
 * @returns The newly created beneficiary document.
 * @throws An error if the user has reached the maximum allowed beneficiaries or if a beneficiary with the same wallet ID already exists.
 */
export const saveNewBeneficiary = async (
  payload: IBeneficiaryPayload,
  user: IUser
): Promise<IBeneficiary> => {
  try {
    // check if user has reached beneficiary count limit
    const beneficiaryCount = await Beneficiary.countDocuments({
      owner: user._id,
    });

    if (beneficiaryCount >= MAX_NUMBER_OF_USER_BENEFICIARIES) {
      throw new Error("Maximum number of beneficiaries reached.");
    }

    // Check if a beneficiary with the same wallet ID already exists for the user
    const beneficiary = await Beneficiary.findOne({
      wallet_id: payload.walletId,
    }).where({ owner: user._id });

    if (beneficiary) {
      throw new Error(
        `Beneficiary with wallet id ${payload.walletId} already exists`
      );
    }

    const accountDetails = await getWalletById(payload.walletId);

    if (!accountDetails) {
      throw new Error('Could not resolve wallet Id. Please try again later')
    }

    const saveNewBeneficiary = new Beneficiary({
      wallet_name: accountDetails.wallet_name,
      alias: payload.alias,
      wallet_id: accountDetails.wallet_id,
      has_alias: payload.alias ? true : false,
      owner: user._id,
    });

    const newbeneficiary =  await saveNewBeneficiary.save();

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "SAVE_BENEFICIARIES",
      user_id: user.id,
      details: `Saved beneficiary: ${newbeneficiary.wallet_name}`,
  })

    return newbeneficiary;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "SAVE_BENEFICIARIES",
      user_id: user.id,
      details: `Saved beneficiary`,
      error_message: error.message || "Could not save new beneficiary"
  })
    console.log("Could not save new beneficiary:", error);
    throw new Error(error.message || "Could not save new beneficiary");
  }
};

/**
 * Retrieve all beneficiaries for a specific user.
 *
 * @param user - The authenticated user whose beneficiaries are being retrieved.
 * @returns An array of beneficiary documents, sorted by the most recently updated.
 * @throws An error if the retrieval fails.
 */
export const getBeneficiaries = async (
  user: IUser
): Promise<IBeneficiary[]> => {
  try {
    // Find beneficiaries belonging to the user and sort by the last update time
    const beneficiaries = await Beneficiary.find()
      .where({ owner: user._id })
      .sort({ updatedAt: -1 });

      console.log(beneficiaries);
      

      if (!beneficiaries || beneficiaries.length === 0) {
        throw new Error("No beneficiary found")
      }

      
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "GET_BENEFICIARIES",
      user_id: user.id,
      details: `Retrieved all beneficiary`,
  })
    return beneficiaries;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "GET_BENEFICIARIES",
      user_id: user.id,
      details: `Retrieved all beneficiary`,
      error_message: error.message || "failed to get beneficiaries",
  })
    console.log("failed to get beneficiaries:", error);
    throw new Error(error.message || "failed to get beneficiaries");
  }
};

/**
 * Retrieve a specific beneficiary by its ID for a user.
 *
 * @param beneficiaryId - The unique ID of the beneficiary.
 * @param user - The authenticated user requesting the beneficiary details.
 * @returns The beneficiary document matching the ID and user.
 * @throws An error if the beneficiary cannot be retrieved.
 */
export const getBeneficiaryById = async (
  beneficiaryId: string,
  user: IUser
): Promise<IBeneficiary> => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId }).where(
      { owner: user._id }
    );

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "GET_A_BENEFICIARY",
      user_id: user.id,
      details: `Viewed a beneficiary`,
  })
    return beneficiary;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "GET_A_BENEFICIARY",
      user_id: user.id,
      details: `Viewed a beneficiary` ,
      error_message: error.message || "failed to get beneficiary details"
  })
    console.log("failed to get beneficiary details:", error);
    throw new Error(error.message || "failed to get beneficiary details");
  }
};

/**
 * Delete a beneficiary by its ID for a user.
 *
 * @param beneficiaryId - The unique ID of the beneficiary to delete.
 * @param user - The authenticated user attempting the deletion.
 * @returns `true` if the deletion is successful.
 * @throws An error if the deletion fails.
 */
export const deleteBeneficiary = async (
  beneficiaryId: string,
  user: IUser
): Promise<boolean> => {
  try {
    const beneficiary = await getBeneficiaryById(beneficiaryId, user);

    await beneficiary.deleteOne();

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "DELETE_A_BENEFICIARY",
      user_id: user.id,
      details: `Deleted a beneficiary`,
  })
    return true;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "DELETE_A_BENEFICIARY",
      user_id: user.id,
      details: `Deleted a beneficiary` ,
      error_message: error.message || "failed to delete beneficiary"
  })
    console.log("failed to delete beneficiary:", error);
    throw new Error(error.message || "failed to delete beneficiary");
  }
};

/**
 * Search for beneficiaries by wallet name, alias, or any field in the document.
 *
 * @param query - The search term to match against multiple fields.
 * @param ownerId - The owner's ID to ensure the search is scoped to their records.
 * @returns An array of matching beneficiaries.
 */
export const searchBeneficiaries = async (
  query: string,
  user: IUser
): Promise<IBeneficiary[]> => {
  try {
    // Build a dynamic search filter
    const searchFilter = {
      owner: user._id,
      // Case-insensitive regex
      $or: [
        { wallet_name: { $regex: query, $options: "i" } },
        { alias: { $regex: query, $options: "i" } },
        { bank_name: { $regex: query, $options: "i" } },
        { wallet_id: { $regex: query, $options: "i" } },
      ],
    };

    // Perform the search query
    const beneficiaries = await Beneficiary.find(searchFilter).exec();
    
    if (!beneficiaries || beneficiaries.length === 0) {
      throw new Error("No beneficiary found")
    }

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "SEARCH_BENEFICIARIES",
      user_id: user.id,
      details: `Searched for beneficiaries`,
  })

    return beneficiaries;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "SEARCH_BENEFICIARIES",
      user_id: user.id,
      details: `Deleted a beneficiary` ,
      error_message: error.message || "failed to search beneficiaries"
  })
    console.error("Error searching beneficiaries:", error);
    throw new Error(error.message || "Failed to search beneficiaries");
  }
};
