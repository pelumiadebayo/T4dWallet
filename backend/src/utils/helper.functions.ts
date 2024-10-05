import { Response, Request } from "express";
import { IUser, User } from "../auth/models/user.model"
import { IOTPResponse } from "./types";
import { readFileSync } from "fs";
import path from 'path';
import { genSalt, hash } from "bcrypt";


/**
 * Sends a successful JSON response.
 *
 * This function constructs a JSON response with a status code of 200, indicating
 * a successful operation. It includes a message and optional data payload.
 *
 * @param res - The Express response object.
 * @param message - A message describing the success.
 * @param data - An optional data payload to include in the response.
 * 
 * @returns The JSON response object.
 */
export function successHandler(res: Response, message: string, data: any): any {
     return res.json({
          statusCode: 200,
          status: "success",
          success: true,
          message,
          data
     })
};


/**
* Sends an error JSON response.
*
* This function constructs a JSON response with a specified error status code.
* It includes an error message and a success flag set to false.
*
* @param res - The Express response object.
* @param message - A message describing the error.
* @param code - The HTTP status code for the error (defaults to 500).
* 
* @returns void
*/
export function errorHandler(res: Response, message: string, code: number = 500) {
     res.status(code).json({
          statusCode: code,
          status: "error",
          success: false,
          message,
     })
};


/**
 * Extended Request interface to include user data.
 *
 * This interface extends the Express Request interface to include additional
 * properties related to user information and file validation errors.
 */
export interface RequestWithUser extends Request {
     fileValidationError: any;
     user: IUser;
};


/**
 * Generates a One-Time Password (OTP) and its expiration time.
 *
 * This function creates a random 6-digit OTP and calculates its expiration time.
 * The OTP is valid for 5 minutes from the time of generation.
 *
 * @returns An object containing the generated OTP and its expiration time.
 *          - otp: The generated OTP as a string.
 *          - expiresAt: The Date object indicating when the OTP expires.
 */
export const generateOTP = (): IOTPResponse => {
     const digits = '0123456789'
     let otp = '';

     for (let i = 0; i < 6; i++) {
          otp += digits[Math.floor(Math.random() * 10)]
     };

     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in milliseconds

     return {
          otp,
          expiresAt
     };
};


/**
 * Reads an HTML email template from the file system.
 *
 * This function constructs the file path for a specified email template and reads
 * the contents of the template file synchronously. The template should be located in 
 * the 'templates' directory relative to the current module's directory.
 *
 * @param templateName - The name of the email template to be read (without the .html extension).
 * 
 * @returns A string containing the HTML content of the email template. 
 *          If the template does not exist or cannot be read, an error will be thrown.
 */
export const readEmailTemplate = (templateName: string): string => {
     const emailTemplatePath = path.join(__dirname, '../', 'templates', `${templateName}.html`);
     return readFileSync(emailTemplatePath, 'utf-8');
};


/**
 * Hashes a password using bcrypt.
 *
 * This function generates a salt and uses it to hash the provided password.
 * The hashing process is asynchronous and uses a cost factor of 10.
 *
 * @param password - The plaintext password to be hashed.
 * 
 * @returns A Promise that resolves to the hashed password as a string.
 * 
 * @throws Error if an error occurs during the hashing process. 
 *         The error message will indicate the nature of the error.
 */
export async function hashPassword(password: string): Promise<string> {
     try {
          const salt = await genSalt(10);
          return await hash(password, salt);
     } catch (error) {
          console.log(error);
          throw new Error('error occured while hashing password');
     };
};