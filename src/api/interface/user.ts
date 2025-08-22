export interface CreateUpdateUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dni: number;
  company_name: string;
  ruc: number;
  contact: number;
  type: string;
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
  type: string;
  createdAt: string;
  updatedAt: string;
}
  