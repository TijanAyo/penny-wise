import { Httpcode } from "./constants";

class notFoundException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "NOT_FOUND_ERROR";
    this.statusCode = Httpcode.NOT_FOUND;
    this.details = details;
  }
}

class unauthorizedException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "UNAUTHORIZED_ERROR";
    this.statusCode = Httpcode.UNAUTHORIZED;
    this.details = details;
  }
}

class internalServerException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "INTERNAL_SERVER_ERROR";
    this.statusCode = Httpcode.INTERNAL_SERVER_ERROR;
    this.details = details;
  }
}

class badRequestException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "BAD_REQUEST_ERROR";
    this.statusCode = Httpcode.BAD_REQUEST;
    this.details = details;
  }
}

class forbiddenException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "FORBIDDEN_ERROR";
    this.statusCode = Httpcode.FORBIDDEN;
    this.details = details;
  }
}

class conflictingException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "CONFLICTING_ERROR";
    this.statusCode = Httpcode.CONFLICTING_ERROR;
    this.details = details;
  }
}

class validationException extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(description: string, details?: Record<string, any>) {
    super(description);
    this.name = "VALIDATION_ERROR";
    this.statusCode = Httpcode.VALIDATION_ERROR;
    this.details = details;
  }
}

export {
  notFoundException,
  unauthorizedException,
  internalServerException,
  badRequestException,
  forbiddenException,
  conflictingException,
  validationException,
};
