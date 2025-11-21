export interface ZellerCustomer {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

export interface ZellerCustomerConnection {
  items: ZellerCustomer[];
  nextToken?: string | null;
}

export interface TableZellerCustomerFilterInput {
  id?: TableStringFilterInput;
  name?: TableStringFilterInput;
  email?: TableStringFilterInput;
  role?: TableStringFilterInput;
}

export interface TableStringFilterInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: string[];
  beginsWith?: string;
}

export interface ListZellerCustomersQuery {
  filter?: TableZellerCustomerFilterInput;
  limit?: number;
  nextToken?: string;
}

export type UserRole = 'All' | 'Admin' | 'Manager';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormData {
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

// GraphQL Mutation Input Types
export interface CreateZellerCustomerInput {
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

export interface UpdateZellerCustomerInput {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

export interface DeleteZellerCustomerInput {
  id: string;
}
