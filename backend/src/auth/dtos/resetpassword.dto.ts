import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDTO {
     @IsNotEmpty()
     @IsString()
     otp: string;

     @IsStrongPassword({
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
        })
     @IsNotEmpty()
     @IsString()
     newPassword: string;
}