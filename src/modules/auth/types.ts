export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginRequest {
  email: string;
  password: string;
}
