import { ServerActionErrorParams } from "@/app/_utils/types/error-server-action.interface";

export class DatabaseOperationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class NotFoundError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class InputParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class AlreadyExistsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}


export class ServerActionError extends Error {
  code: string;
  field?: string;

  constructor({ message, code, field }: ServerActionErrorParams) {
    super(message);
    this.name = "ServerActionError";
    this.code = code;
    this.field = field;
  }
}
