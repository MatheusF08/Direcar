import { Request } from 'express';

export interface UserPayload {
  userId: number;
  name: string;
  companyName: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}
export {};