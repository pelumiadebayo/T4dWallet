import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';


export class SearchTransactionDto {
  @IsOptional()
  @IsEnum(["CREDIT", "DEBIT"], { message: "transaction_type must be either CREDIT or DEBIT" })
  transaction_type?: "CREDIT" | "DEBIT";

  @IsOptional()
  @IsNumber({}, { message: "minAmount must be a number" })
  @Min(0, { message: "minAmount must be greater than or equal to 0" })
  minAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: "maxAmount must be a number" })
  @Min(0, { message: "maxAmount must be greater than or equal to 0" })
  maxAmount?: number;

  @IsOptional()
  @IsString({ message: "currency must be a string" })
  currency?: string;

  @IsOptional()
  @IsEnum(["SUCCESSFUL", "PENDING", "FAILED"], { message: "transaction_status can only be successful, pending or failed" })
  transaction_status?: "SUCCESSFUL" | "PENDING" | "FAILED";

  @IsOptional()
  @IsDateString({}, { message: "startDate must be a valid date string" })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "endDate must be a valid date string" })
  endDate?: string;

  @IsOptional()
  @IsNumber({}, { message: "page must be a number" })
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: "limit must be a number" })
  limit?: number;
}

export class FilterByDateDto {
  @IsOptional()
  @IsDateString({}, { message: "startDate must be a valid date string" })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "endDate must be a valid date string" })
  endDate?: string;  

  @IsOptional()
  @IsNumber({}, { message: "page must be a number" })
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: "limit must be a number" })
  limit?: number;
}
