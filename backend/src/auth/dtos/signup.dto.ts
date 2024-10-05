import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class SignupDTO {
     @IsNotEmpty()
     @IsString()
     firstName: string;

     @IsNotEmpty()
     @IsString()
     lastName: string;

     @IsNotEmpty()
     @IsEmail()
     @IsString()
     email: string;

     @IsStrongPassword({
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
        })
     @IsNotEmpty()
     @IsString()
     password: string;
}