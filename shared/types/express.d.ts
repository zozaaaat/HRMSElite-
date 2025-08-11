import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      role?: string | null;
      companyId?: string | null;
      sub?: string;
    }
    
    interface Request {
      user?: User;
    }
  }
}

export {};
