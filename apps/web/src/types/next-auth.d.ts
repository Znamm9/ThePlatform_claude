import 'next-auth';
import { UserRole } from '@repo/shared';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    accessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      emailVerified: boolean;
      image?: string;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    emailVerified: boolean;
    accessToken?: string;
  }
}
