import { User } from "@prisma/client";

export interface RegisterInput {
    email: string;
    password: string;
    name?: string;
  }

  export interface LoginInput {
    email: string;
    password: string;
  }

  export type SafeUser = Omit<User, 'password'>;