import {ApolloClient, InMemoryCache, gql, createHttpLink} from '@apollo/client';
import {
  ZellerCustomerConnection, 
  ListZellerCustomersQuery, 
  ZellerCustomer,
  CreateZellerCustomerInput,
  UpdateZellerCustomerInput,
  DeleteZellerCustomerInput
} from '../types';
import awsconfig from '../../aws-exports';

// GraphQL response interface
interface ListZellerCustomersResponse {
  listZellerCustomers: ZellerCustomerConnection;
}

const httpLink = createHttpLink({
  uri: awsconfig.aws_appsync_graphqlEndpoint,
  headers: {
    'x-api-key': awsconfig.aws_appsync_apiKey,
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export const LIST_ZELLER_CUSTOMERS = gql`
  query ListZellerCustomers(
    $filter: TableZellerCustomerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listZellerCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        role
      }
      nextToken
    }
  }
`;

export const CREATE_ZELLER_CUSTOMER = gql`
  mutation CreateZellerCustomer($input: CreateZellerCustomerInput!) {
    createZellerCustomer(input: $input) {
      id
      name
      email
      role
    }
  }
`;

export const UPDATE_ZELLER_CUSTOMER = gql`
  mutation UpdateZellerCustomer($input: UpdateZellerCustomerInput!) {
    updateZellerCustomer(input: $input) {
      id
      name
      email
      role
    }
  }
`;

export const DELETE_ZELLER_CUSTOMER = gql`
  mutation DeleteZellerCustomer($input: DeleteZellerCustomerInput!) {
    deleteZellerCustomer(input: $input) {
      id
    }
  }
`;

export class GraphQLService {
  public static async fetchAllCustomers(
    variables?: ListZellerCustomersQuery
  ): Promise<ZellerCustomerConnection> {
    try {
      const result = await apolloClient.query<ListZellerCustomersResponse>({
        query: LIST_ZELLER_CUSTOMERS,
        variables,
        fetchPolicy: 'network-only', // Always fetch from network for fresh data
      });
      return result?.data?.listZellerCustomers || { items: [], nextToken: null };
    } catch (error) {
      console.error('Error fetching customers from GraphQL:', error);
      throw error;
    }
  }

  public static async fetchCustomersByRole(
    role: 'Admin' | 'Manager'
  ): Promise<ZellerCustomerConnection> {
    return this.fetchAllCustomers({
      filter: {
        role: {
          eq: role,
        },
      },
    });
  }

  public static async createCustomer(
    customer: Omit<ZellerCustomer, 'id'>
  ): Promise<ZellerCustomer> {
    try {
      const result = await apolloClient.mutate<{createZellerCustomer: ZellerCustomer}>({
        mutation: CREATE_ZELLER_CUSTOMER,
        variables: {
          input: customer,
        },
      });
      
      if (!result.data?.createZellerCustomer) {
        throw new Error('Failed to create customer - no data returned');
      }
      
      return result.data.createZellerCustomer;
    } catch (error) {
      console.error('Error creating customer in GraphQL:', error);
      throw error;
    }
  }

  public static async updateCustomer(
    customer: ZellerCustomer
  ): Promise<ZellerCustomer> {
    try {
      const result = await apolloClient.mutate<{updateZellerCustomer: ZellerCustomer}>({
        mutation: UPDATE_ZELLER_CUSTOMER,
        variables: {
          input: customer,
        },
      });
      
      if (!result.data?.updateZellerCustomer) {
        throw new Error('Failed to update customer - no data returned');
      }
      
      return result.data.updateZellerCustomer;
    } catch (error) {
      console.error('Error updating customer in GraphQL:', error);
      throw error;
    }
  }

  public static async deleteCustomer(id: string): Promise<string> {
    try {
      const result = await apolloClient.mutate<{deleteZellerCustomer: {id: string}}>({
        mutation: DELETE_ZELLER_CUSTOMER,
        variables: {
          input: { id },
        },
      });
      
      if (!result.data?.deleteZellerCustomer?.id) {
        throw new Error('Failed to delete customer - no confirmation returned');
      }
      
      return result.data.deleteZellerCustomer.id;
    } catch (error) {
      console.error('Error deleting customer in GraphQL:', error);
      throw error;
    }
  }
}
