import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { readEmailTemplate } from "./helper.functions";
import { IForgotPasswordMail, ISignupMail } from "./types";
import { ISignupMail } from "./types";


/**
 * Sends an email using a specified SMTP transporter.
 * 
 * This function uses the nodemailer package to create a transport for sending emails
 * via the Brevo SMTP relay. It retrieves authentication credentials from environment variables
 * and logs the status of the email sending process.
 * 
 * @param options - The options for the email to be sent, which should conform to the 
 *                  SendMailOptions interface provided by nodemailer. This includes fields 
 *                  like the recipient's email address, subject, and body of the email.
 * 
 * @returns A Promise that resolves to void when the email has been processed.
 *          Note: The actual sending is handled asynchronously and logged via callbacks.
 */
export const sendMail = async (options: SendMailOptions): Promise<void> => {

     console.log(process.env.BREVO_USER);
     console.log(process.env.BREVO_PASS);

     const transporter: Transporter = nodemailer.createTransport({
          host: "smtp-relay.brevo.com",
          port: 465,
          auth: {
               user: process.env.BREVO_USER,
               pass: process.env.BREVO_PASS
          },
     });

     transporter.sendMail(options, (err, info) => {
          if (err) {
               console.error('Failed to send email:', err);
          } else {
               console.log('Email sent:', info.response);
          }
     });
};


/**
 * Sends a sign-up confirmation email with an OTP (One-Time Password) to the user.
 *
 * This function generates an email content using a specified email template and replaces
 * placeholders with the user's first name and the OTP. It then sends the email using the
 * `sendMail` function. The function returns a confirmation message upon successful delivery.
 *
 * @param payload - An object containing the details required to send the sign-up email.
 *                  It should include:
 *                  - email: The recipient's email address.
 *                  - otp: The one-time password to include in the email.
 *                  - firstName: The first name of the recipient to personalize the email.
 *
 * @returns A Promise that resolves to a string indicating the status of the email delivery.
 *          Specifically, it returns "Email Delivered" if the email is sent successfully.
 */
export async function sendSignUpMail(payload: ISignupMail): Promise<string> {

     const { email, otp, firstName } = payload

     const emailTemplate = readEmailTemplate('confirmEmail')

     const emailContent = emailTemplate
          .replace('{{OTP}}', otp)
          .replace('{{firstname}}', firstName)

     const mailOptions: SendMailOptions = {
          from: '"Td4Wallet" <td4wallet@gmail.com>',
          to: email,
          subject: "Email Verification",
          html: emailContent
     };

     await sendMail(mailOptions);

     return "Email Delivered"
}

export async function sendForgotPasswordMail(payload: IForgotPasswordMail): Promise<string> {

     const { email, otp } = payload

     const emailTemplate = readEmailTemplate('confirmEmail')

     const emailContent = emailTemplate
          .replace('{{OTP}}', otp)

     const mailOptions: SendMailOptions = {
          from: '"Td4Wallet" <td4wallet@gmail.com>',
          to: email,
          subject: "Email Verification",
          html: emailContent
     };

     await sendMail(mailOptions);

     return "Email Delivered"

}