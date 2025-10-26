import { ROLES } from '@utils/constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: typeof ROLES.ADMIN | typeof ROLES.USER;
  //... other fields
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: typeof ROLES.ADMIN | typeof ROLES.USER | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}