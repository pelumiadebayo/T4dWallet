export type TForgotPasswordPayload = {
     email: string;
};

export type TResetPasswordPayload = {
     otp: string;
     newPassword: string;
};

