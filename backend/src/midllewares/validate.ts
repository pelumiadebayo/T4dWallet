import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

/**
 * Middleware to validate the request body against a DTO (Data Transfer Object).
 *
 * This function transforms the request body into an instance of the specified DTO
 * and validates it using class-validator. If validation fails, it sends a 400 
 * response with error messages. If validation succeeds, it modifies the request 
 * body and calls the next middleware in the chain.
 *
 * @param dto - A constructor function for the DTO to which the request body will be validated.
 * 
 * @returns A middleware function that processes the request.
 */
export function validateBody<T extends object>(dto: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const output = plainToInstance(dto, req.body);
    const errors = await validate(output);

    if (errors.length > 0) {
      const errorMessages = errors.map(err => {
        return Object.values(err.constraints || {});
      }).flat();

      res.status(400).json({ errors: errorMessages });
      return;
    }

    req.body = output;
    next();
  };
}

 
 /**
 * Middleware to validate request parameters against a DTO (Data Transfer Object).
 *
 * This function transforms the request parameters into an instance of the specified DTO
 * and validates it using class-validator. If validation fails, it sends a 400 
 * response with error messages. If validation succeeds, it modifies the request 
 * parameters and calls the next middleware in the chain.
 *
 * @param dto - A constructor function for the DTO to which the request parameters will be validated.
 * 
 * @returns A middleware function that processes the request.
 */
 export function validateParams<T extends ParamsDictionary>(dto: new () => T) {
     return async (req: Request, res: Response, next: NextFunction) => {
         const output = plainToInstance(dto, req.params);
         const errors = await validate(output);
 
         if (errors.length > 0) {
           const errorMessages = errors.map(err => {
               return Object.values(err.constraints || {});
           }).flat();
 
           return res.status(400).json({ errors: errorMessages });
         } else {
             req.params = output;
             next();
         }
     };
 }
 