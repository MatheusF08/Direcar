import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: number;
      name: string;
      companyName: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};