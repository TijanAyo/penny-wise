import {
  badRequestException,
  conflictingException,
  forbiddenException,
  internalServerException,
  notFoundException,
  unauthorizedException,
  validationException,
} from "./exception";
import { Response } from "express";
import { Httpcode } from "./constants";
import { injectable } from "tsyringe";

const errorMapping = new Map([
  [notFoundException, Httpcode.NOT_FOUND],
  [badRequestException, Httpcode.BAD_REQUEST],
  [internalServerException, Httpcode.INTERNAL_SERVER_ERROR],
  [unauthorizedException, Httpcode.UNAUTHORIZED],
  [forbiddenException, Httpcode.FORBIDDEN],
  [conflictingException, Httpcode.CONFLICTING_ERROR],
  [validationException, Httpcode.VALIDATION_ERROR],
]);
@injectable()
export class ErrorHandler {
  async handleCustomError(err: any, res: Response) {
    for (const [ErrorClass, statusCode] of errorMapping) {
      if (err instanceof ErrorClass) {
        return res.status(statusCode).json({
          error: err.name,
          message: err.message,
          success: false,
          details: {},
        });
      }
    }

    // If the error is not one of the custom error classes, handle it as a generic internal server error
    console.error(err);
    return res.status(Httpcode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERR",
      message:
        "An error occurred while processing your request. Please try again later.",
      success: false,
      details: {},
    });
  }
}
