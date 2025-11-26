import {create} from 'zustand';
import {ZellerCustomer, UserRole} from '../types';
import {DatabaseService} from '../database/DatabaseService';
import {GraphQLService} from '../services/GraphQLService';

const ENABLE_REMOTE_MUTATIONS = false;

const normalizeRole = (role: string): 'Admin' | 'Manager' => {
  const normalized = String(role).trim().toLowerCase();

  if (normalized.includes('admin')) {
    return 'Admin';
  }

  return 'Manager';
};

const normalizeCustomer = (customer: ZellerCustomer): ZellerCustomer => ({
  ...customer,
  role: normalizeRole(customer.role),
});

const normalizeCustomers = (customers: ZellerCustomer[]): ZellerCustomer[] =>
  customers.map(normalizeCustomer);

const createLocalCustomer = (
  customer: Omit<ZellerCustomer, 'id'>,
): ZellerCustomer => ({
  ...customer,
  id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
});

interface CustomerState {
  customers: ZellerCustomer[];
  filteredCustomers: ZellerCustomer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedRole: UserRole;
  refreshing: boolean;
}

interface CustomerActions {
  loadCustomers: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<ZellerCustomer, 'id'>) => Promise<void>;
  updateCustomer: (customer: ZellerCustomer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedRole: (role: UserRole) => void;
  filterCustomers: () => void;
  clearError: () => void;
}

type CustomerStore = CustomerState & CustomerActions;

export const useCustomerStore = create<CustomerStore>((set, get) => {
  const getDbService = () => DatabaseService.getInstance();

  return {
    // Initial state
    customers: [],
    filteredCustomers: [],
    loading: false,
    error: null,
    searchTerm: '',
    selectedRole: 'All',
    refreshing: false,

    // Actions
    loadCustomers: async () => {
      try {
        set({loading: true, error: null});

        const dbService = getDbService();

        // Test database connection first
        const dbConnectionOk = await dbService.testDatabaseConnection();
        if (dbConnectionOk) {
          await dbService.testInsertSingleCustomer();
        }

        let customers: ZellerCustomer[] = [];

        const customerCount = await dbService.getCustomerCount();

        // If there is no data locally, seed once from GraphQL
        if (customerCount === 0) {
          try {
            const response = await GraphQLService.fetchAllCustomers();
            if (response.items && response.items.length > 0) {
              try {
                await dbService.insertCustomers(response.items);
              } catch (insertError: any) {
                console.error('Error inserting customers:', insertError);
                
                // Check if it's a role constraint error
                if (insertError.message && insertError.message.includes('CHECK constraint failed: role')) {
                  try {
                    await dbService.recreateTableWithoutConstraint();
                    await dbService.insertCustomers(response.items);
                  } catch (recreateError) {
                    console.error('Failed to recreate table and insert customers:', recreateError);
                    throw recreateError;
                  }
                } else {
                  throw insertError;
                }
              }
              
              // Verify data was actually saved
              const verifyCustomers = await dbService.getAllCustomers();
              customers = verifyCustomers;
            }
          } catch (networkError) {
            // Continue with (currently empty) local data if network fails
          }
        }

        // If we didn't populate customers from GraphQL seeding, load from local DB
        if (customers.length === 0) {
          const localCustomers = await dbService.getAllCustomers();
          customers = localCustomers;
        }

        set({customers: normalizeCustomers(customers)});

        // Apply current filters
        get().filterCustomers();
      } catch (error) {
        set({error: 'Failed to load customers'});
        console.error('Error loading customers:', error);
      } finally {
        set({loading: false});
      }
    },

    refreshCustomers: async () => {
      try {
        set({refreshing: true, error: null});

        const dbService = getDbService();

        // For refresh, just reload the latest state from local database
        const localCustomers = await dbService.getAllCustomers();
        set({customers: normalizeCustomers(localCustomers)});
        get().filterCustomers();
      } catch (error) {
        set({error: 'Failed to refresh customers'});
        console.error('Error refreshing customers:', error);
      } finally {
        set({refreshing: false});
      }
    },

    addCustomer: async (customerData: Omit<ZellerCustomer, 'id'>) => {
      try {
        const dbService = getDbService();
        let newCustomer: ZellerCustomer;

        if (ENABLE_REMOTE_MUTATIONS) {
          try {
            newCustomer = await GraphQLService.createCustomer(customerData);
          } catch (error) {
            console.log('Remote create failed, saving locally instead:', error);
            newCustomer = createLocalCustomer(customerData);
          }
        } else {
          newCustomer = createLocalCustomer(customerData);
        }

        await dbService.insertCustomer(newCustomer);
        
        const normalizedCustomer = normalizeCustomer(newCustomer);
        set(state => ({
          customers: [...state.customers, normalizedCustomer],
        }));

        get().filterCustomers();
      } catch (error) {
        set({error: 'Failed to add customer'});
        console.error('Error adding customer:', error);
        throw error;
      }
    },

    updateCustomer: async (customer: ZellerCustomer) => {
      try {
        const dbService = getDbService();
        if (ENABLE_REMOTE_MUTATIONS) {
          try {
            await GraphQLService.updateCustomer(customer);
          } catch (error) {
            console.log('Remote update failed, continuing with local update:', error);
          }
        }

        await dbService.updateCustomer(customer);
        
        const normalizedCustomer = normalizeCustomer(customer);
        set(state => ({
          customers: state.customers.map(c =>
            c.id === normalizedCustomer.id ? normalizedCustomer : c
          ),
        }));

        get().filterCustomers();
      } catch (error) {
        set({error: 'Failed to update customer'});
        console.error('Error updating customer:', error);
        throw error;
      }
    },

    deleteCustomer: async (id: string) => {
      try {
        const dbService = getDbService();
        if (ENABLE_REMOTE_MUTATIONS) {
          try {
            await GraphQLService.deleteCustomer(id);
          } catch (error) {
            console.log('Remote delete failed, removing locally:', error);
          }
        }

        await dbService.deleteCustomer(id);
        
        set(state => ({
          customers: state.customers.filter(c => c.id !== id),
        }));

        get().filterCustomers();
      } catch (error) {
        set({error: 'Failed to delete customer'});
        console.error('Error deleting customer:', error);
        throw error;
      }
    },

    setSearchTerm: (term: string) => {
      set({searchTerm: term});
      // Auto-filter when search term changes
      setTimeout(() => get().filterCustomers(), 0);
    },

    setSelectedRole: (role: UserRole) => {
      set({selectedRole: role});
      // Auto-filter when role changes
      setTimeout(() => get().filterCustomers(), 0);
    },

    filterCustomers: () => {
      const {customers, selectedRole, searchTerm} = get();
      let filtered = [...customers];

      // Filter by role
      if (selectedRole !== 'All') {
        filtered = filtered.filter(customer => customer.role === selectedRole);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(customer =>
          customer.name.toLowerCase().includes(searchLower)
        );
      }

      set({filteredCustomers: filtered});
    },

    clearError: () => {
      set({error: null});
    },
  };
});
