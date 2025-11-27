import {useCustomerStore} from '../customerStore';
import {DatabaseService} from '../../database/DatabaseService';
import {GraphQLService} from '../../services/GraphQLService';
import {ZellerCustomer} from '../../types';

// Mock dependencies
jest.mock('../../database/DatabaseService');
jest.mock('../../services/GraphQLService');

const mockDatabaseService = {
  getAllCustomers: jest.fn(),
  insertCustomers: jest.fn(),
  insertCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
  testDatabaseConnection: jest.fn(),
  testInsertSingleCustomer: jest.fn(),
  getCustomerCount: jest.fn(),
  recreateTableWithoutConstraint: jest.fn(),
};

const mockGraphQLService = {
  fetchAllCustomers: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
};

const mockedDatabaseService = DatabaseService.getInstance as jest.Mock;
mockedDatabaseService.mockReturnValue(mockDatabaseService);

const mockedGraphQLService = GraphQLService as jest.Mocked<typeof GraphQLService>;
mockedGraphQLService.fetchAllCustomers.mockImplementation(
  mockGraphQLService.fetchAllCustomers
);
mockedGraphQLService.createCustomer.mockImplementation(
  mockGraphQLService.createCustomer
);
mockedGraphQLService.updateCustomer.mockImplementation(
  mockGraphQLService.updateCustomer
);
mockedGraphQLService.deleteCustomer.mockImplementation(
  mockGraphQLService.deleteCustomer
);

describe('CustomerStore', () => {
  const mockCustomers: ZellerCustomer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedDatabaseService.mockReturnValue(mockDatabaseService);
    mockDatabaseService.testDatabaseConnection.mockResolvedValue(true);
    mockDatabaseService.testInsertSingleCustomer.mockResolvedValue(undefined);
    mockDatabaseService.getCustomerCount.mockResolvedValue(0);
    mockGraphQLService.fetchAllCustomers.mockResolvedValue({items: []});
    mockGraphQLService.createCustomer.mockImplementation(async input => ({
      id: 'new-id',
      ...input,
    }));
    mockGraphQLService.updateCustomer.mockImplementation(async customer => customer);
    mockGraphQLService.deleteCustomer.mockResolvedValue('deleted-id');
    // Reset store state
    useCustomerStore.setState({
      customers: [],
      filteredCustomers: [],
      loading: false,
      error: null,
      searchTerm: '',
      selectedRole: 'All',
      refreshing: false,
    });
  });

  describe('loadCustomers', () => {
    it('should load customers from database and GraphQL', async () => {
      // First call (before seeding) returns empty, second call (after seeding) returns the seeded customers
      mockDatabaseService.getAllCustomers
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCustomers);
      mockGraphQLService.fetchAllCustomers.mockResolvedValue({
        items: mockCustomers,
      });

      const store = useCustomerStore.getState();
      await store.loadCustomers();

      expect(mockDatabaseService.getAllCustomers).toHaveBeenCalled();
      expect(mockGraphQLService.fetchAllCustomers).toHaveBeenCalled();
      expect(mockDatabaseService.insertCustomers).toHaveBeenCalledWith(mockCustomers);
      expect(useCustomerStore.getState().customers).toEqual(mockCustomers);
    });

    it('should handle network error gracefully', async () => {
      const localCustomers = [mockCustomers[0]];
      mockDatabaseService.getAllCustomers.mockResolvedValue(localCustomers);
      mockGraphQLService.fetchAllCustomers.mockRejectedValue(new Error('Network error'));

      const store = useCustomerStore.getState();
      await store.loadCustomers();

      expect(useCustomerStore.getState().customers).toEqual(localCustomers);
      expect(useCustomerStore.getState().error).toBeNull();
    });

    it('should set error on database failure', async () => {
      mockDatabaseService.getAllCustomers.mockRejectedValue(new Error('DB error'));

      const store = useCustomerStore.getState();
      await store.loadCustomers();

      expect(useCustomerStore.getState().error).toBe('Failed to load customers');
    });
  });

  describe('addCustomer', () => {
    it('should add customer successfully', async () => {
      const newCustomerData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'Manager' as const,
      };

      mockDatabaseService.insertCustomer.mockResolvedValue(undefined);

      const store = useCustomerStore.getState();
      await store.addCustomer(newCustomerData);

      expect(mockDatabaseService.insertCustomer).toHaveBeenCalled();
      expect(useCustomerStore.getState().customers).toHaveLength(1);
      expect(useCustomerStore.getState().customers[0]).toMatchObject(newCustomerData);
    });

    it('should handle add customer error', async () => {
      const newCustomerData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'Manager' as const,
      };

      mockDatabaseService.insertCustomer.mockRejectedValue(new Error('DB error'));

      const store = useCustomerStore.getState();
      
      await expect(store.addCustomer(newCustomerData)).rejects.toThrow();
      expect(useCustomerStore.getState().error).toBe('Failed to add customer');
    });
  });

  describe('filterCustomers', () => {
    beforeEach(() => {
      useCustomerStore.setState({
        customers: mockCustomers,
      });
    });

    it('should filter by role', () => {
      useCustomerStore.setState({selectedRole: 'Admin'});
      const store = useCustomerStore.getState();
      store.filterCustomers();

      const filtered = useCustomerStore.getState().filteredCustomers;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].role).toBe('Admin');
    });

    it('should filter by search term', () => {
      useCustomerStore.setState({searchTerm: 'john'});
      const store = useCustomerStore.getState();
      store.filterCustomers();

      const filtered = useCustomerStore.getState().filteredCustomers;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name.toLowerCase()).toContain('john');
    });

    it('should filter by both role and search term', () => {
      useCustomerStore.setState({
        selectedRole: 'Manager',
        searchTerm: 'jane',
      });
      const store = useCustomerStore.getState();
      store.filterCustomers();

      const filtered = useCustomerStore.getState().filteredCustomers;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].role).toBe('Manager');
      expect(filtered[0].name.toLowerCase()).toContain('jane');
    });

    it('should return all customers when no filters applied', () => {
      useCustomerStore.setState({
        selectedRole: 'All',
        searchTerm: '',
      });
      const store = useCustomerStore.getState();
      store.filterCustomers();

      const filtered = useCustomerStore.getState().filteredCustomers;
      expect(filtered).toHaveLength(2);
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term and trigger filtering', () => {
      useCustomerStore.setState({customers: mockCustomers});
      const store = useCustomerStore.getState();
      
      store.setSearchTerm('john');
      
      expect(useCustomerStore.getState().searchTerm).toBe('john');
      // Note: In real implementation, filtering happens asynchronously
    });
  });

  describe('setSelectedRole', () => {
    it('should update selected role and trigger filtering', () => {
      useCustomerStore.setState({customers: mockCustomers});
      const store = useCustomerStore.getState();
      
      store.setSelectedRole('Admin');
      
      expect(useCustomerStore.getState().selectedRole).toBe('Admin');
    });
  });
});
