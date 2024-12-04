import { isValidObjectId, Types } from "mongoose";
import { User, IUser } from "../../auth/models/user.model";
import {
  deleteFromCloudinary,
  extractCloudinaryPublicId,
  uploadToCloudinary,
} from "../../utils/cloudinary";
import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../../logs/events/log.event";

export class UserService {
  /**
   * Edits an existing user's details. This method finds the user by their ID, updates their data with the provided
   * `userData` object, and returns the updated user.
   *
   * @param {string | Types.ObjectId} userId - The ID of the user to be updated. Can be a string or an ObjectId.
   * @param {Partial<IUser>} userData - An object containing the user's data to be updated. Only the properties provided
   * will be updated.
   * @returns {Promise<IUser>} A promise that resolves to the updated user object.
   * @throws {Error} If the user ID is invalid or the user does not exist.
   *
   */
  static async editUser(
    userId: string | Types.ObjectId,
    userData: Partial<IUser>
  ) {
   try {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user Id");
    }

    const user = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    if (user == null) {
      throw new Error("user does not exist");
    }
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "EDIT_USER",
      user_id: userId,
      details: `Edited user details`,
    });

    return user;
   } catch(error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "EDIT_USER",
      user_id: userId,
      details: `Edited user details`,
      error_message: error.message || "Could not edit user details"
    });
    console.log('Could not delete picture');
    throw new Error(error.message || "Could not edit user details");
  }
  }

  /**
   * Update user profile picture.
   *
   * @param userId - The ID of the user to update.
   * @param reqFile - The file path or null if no file uploaded.
   * @returns {Promise<IUser>} - The updated user object.
   * @throws {Error} - If the user is not found or if the image upload fails.
   */
  static async updateUserProfilePicture(
    userId: Types.ObjectId,
    reqFile: string | null
  ) {
    let imageUpload;
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (reqFile) {
        imageUpload = await uploadToCloudinary(reqFile);
        user.image = imageUpload.secure_url;

        await user.save();
      }

      appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
        status: "success",
        action: "UPDATE_PROFILE_PICTURE",
        user_id: user.id,
        details: `Uploaded Profile picture`,
      });
      return user;
    } catch (error: any) {
      appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
        status: "failed",
        action: "UPDATE_PROFILE_PICTURE",
        user_id: userId,
        details: `Uploaded Profile picture`,
        error_message: error.message || "Could not upload picture"
      });
      console.log("Could not upload picture:- ", error);
      
      if (imageUpload) {
        await deleteFromCloudinary(imageUpload.public_id);
      }
      throw new Error(error.message || "Could not upload picture");
    }
  }

  /**
   * Delete user profile picture.
   *
   * @param userId - The ID of the user to delete the profile picture from.
   * @returns {Promise<IUser>} - The updated user object with no profile picture.
   * @throws {Error} - If the user is not found or no profile picture exists to delete.
   */
  static async deleteUserProfilePicture(userId: Types.ObjectId) {
    try {
      const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.image) {
      throw new Error("No profile picture to delete");
    }

    const publicId = extractCloudinaryPublicId(user.image);

    await deleteFromCloudinary(publicId);

    user.image = "";
    await user.save();

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "DELETE_PROFILE_PICTURE",
      user_id: userId,
      details: `Deleted Profile picture`,
    });
    return user;
    } catch(error: any) {
      appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
        status: "failed",
        action: "DELETE_PROFILE_PICTURE",
        user_id: userId,
        details: `Deleted Profile picture`,
        error_message: error.message || "Could not delete picture"
      });
      console.log('Could not delete picture');
      throw new Error(error.message || "Could not delete picture");
    }
  }

  /**
   * Get a user by ID.
   *
   * @param userId - The ID of the user to retrieve.
   * @returns {Promise<IUser | null>} - The user object or null if not found.
   * @throws {Error} - If the user ID is invalid.
   */
  static async getUserById(userId: Types.ObjectId | string) {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId);

    return user;
  }
}
