import { appEmitter } from "../../globals/events";
import { LOG_EVENTS } from "../../logs/events/log.event";
import {
  generateAccessToken,
  isValidPassword,
} from "../../utils/helper.functions";
import { ILogin, ILoginServiceResult } from "../interfaces/login.interface";
import { findByEmail } from "../queries/signup.queries";

/**
 * Authenticates a user and generates an access token upon successful login.
 *
 * @param data - The login credentials containing email and password.
 * @returns An object containing the authenticated user and a generated access token.
 * @throws An error if the email is not associated with any user or if the password is invalid.
 */
export const loginService = async (
  data: ILogin
): Promise<ILoginServiceResult> => {
  const { password, email } = data;
 try {

  const userExist = await findByEmail({ email });

  if (!userExist) throw new Error("Invalid school id");

  if (!(await isValidPassword(password, userExist.password_hash)))
    throw new Error("Invalid Password");

  const token = generateAccessToken(userExist.id);
  
  appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
    status: "success",
    action: "LOGIN",
    user_id: userExist.id,
    details: `Logged in`,
})

  return {
    user: userExist,
    token,
  };
 } catch (error: any) {
  appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
    status: "failed",
    action: "LOGIN",
    user_id: email,
    details: `Could not be Logged in`,
    error_message: error.message,
})
  throw new Error(error.message || "Could not login to account")
 }
};
