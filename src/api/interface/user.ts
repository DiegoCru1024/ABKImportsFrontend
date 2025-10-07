export interface CreateUpdateUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string|null;
  dni: number;
  company_name: string;
  ruc: number;
  contact: number;
  type: string;
}

export type UpdateUser = Omit<CreateUpdateUser, 'password'>;
export enum UserType {
  ADMIN = 'admin',
  TEMPORAL = 'temporal',
  GUEST = 'guest',
  FINAL = 'final',
}

export interface UserProfileWithPagination {
  content: UserProfile[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}


export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  company_name: string;
  ruc: string;
  contact: number;
  type: UserType;
  createdAt: string;
  updatedAt: string;
}


export interface UserDTO{
  id: string;
  name: string;
  email: string;
}