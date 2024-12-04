import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import {
  errorHandler,
  RequestWithUser,
  successHandler,
} from "../../utils/helper.functions";
import { Types } from "mongoose";

export class UserController {
  /**
   * Edit user profile details.
   *
   * @param req - The request object containing the user data to be updated.
   * @param res - The response object used to send the success or error response.
   * @returns {Promise<Response>} - The result of the update operation.
   */
  static async editUser(req: RequestWithUser, res: Response) {
    try {
      const userId: Types.ObjectId = req.user._id as Types.ObjectId;
      const userData = req.body;

      const updatedUser = await UserService.editUser(userId, userData);

      return successHandler(
        res,
        "User profile updated successfully",
        updatedUser
      );
    } catch (error) {
      return errorHandler(res, "Failed to update user");
    }
  }

  /**
   * Upload or update user profile picture.
   *
   * @param req - The request object containing the file uploaded by the user.
   * @param res - The response object used to send the success or error response.
   * @returns {Promise<Response>} - The result of the update operation.
   */

  static async updateUserProfilePicture(req: RequestWithUser, res: Response) {
    try {
      const userId: Types.ObjectId = req.user._id as Types.ObjectId;
      const file = req.file ? req.file.path : null;

      const updatedUser = await UserService.updateUserProfilePicture(
        userId,
        file
      );

      return successHandler(
        res,
        "User profile updated successfully",
        updatedUser
      );
    } catch (error) {
      console.log(error);
      return errorHandler(res, "Failed to update user profile picture");
    }
  }

  /**
   * Delete the user's profile picture.
   *
   * @param req - The request object containing the user ID.
   * @param res - The response object used to send the success or error response.
   * @returns {Promise<Response>} - The result of the delete operation.
   */
  static async deleteUserProfilePicture(req: RequestWithUser, res: Response) {
    try {
      const userId: Types.ObjectId = req.user._id as Types.ObjectId;
      const updatedUser = await UserService.deleteUserProfilePicture(userId);

      return successHandler(
        res,
        "Profile picture deleted successfully",
        updatedUser
      );
    } catch (error) {
      return errorHandler(res, "Failed to delete profile picture");
    }
  }

  /**
   * Get the current user's profile data.
   *
   * @param req - The request object containing the user's ID.
   * @param res - The response object used to send the success or error response.
   * @returns {Promise<Response>} - The current user's data.
   */
  static async getCurrentUser(req: RequestWithUser, res: Response) {
    try {
      const currentUser = await UserService.getUserById(req.user.id);

      return successHandler(
        res,
        "Current user retrieved successfully",
        currentUser
      );
    } catch (error) {
      return errorHandler(res, "Failed to retrieve current user");
    }
  }
}
