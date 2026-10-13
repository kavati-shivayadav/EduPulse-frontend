export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  type: string;
  user: User;
}
