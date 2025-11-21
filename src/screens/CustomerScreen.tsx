import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert} from 'react-native';
import PagerView from 'react-native-pager-view';
import Feather from 'react-native-vector-icons/Feather';
import {useCustomerStore} from '../store/customerStore';
import {CustomerList} from '../components/CustomerList';
import {SearchBar} from '../components/SearchBar';
import {TabSelector} from '../components/TabSelector';
import {ZellerCustomer, UserRole} from '../types';

interface CustomerScreenProps {
  onAddCustomer: () => void;
  onEditCustomer: (customer: ZellerCustomer) => void;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({
  onAddCustomer,
  onEditCustomer,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const {
    customers,
    loading,
    error,
    searchTerm,
    selectedRole,
    refreshing,
    loadCustomers,
    refreshCustomers,
    deleteCustomer,
    setSearchTerm,
    setSelectedRole,
    filterCustomers,
    clearError,
  } = useCustomerStore();

  const pagerRef = useRef<PagerView>(null);

  // Role mapping for pages
  const roles: UserRole[] = ['All', 'Admin', 'Manager'];

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (error) {
      if (Alert && typeof Alert.alert === 'function') {
        Alert.alert('Error', error, [
          {text: 'OK', onPress: clearError},
        ]);
      } else {
        clearError();
      }
    }
  }, [error, clearError]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, selectedRole, filterCustomers]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const pageIndex = roles.indexOf(role);
    if (pageIndex !== -1) {
      pagerRef.current?.setPage(pageIndex);
    }
  };

  const handlePageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setSelectedRole(roles[position]);
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const getFilteredCustomersForRole = (role: UserRole) => {
    let roleCustomers = customers;
    
    if (role !== 'All') {
      roleCustomers = customers.filter(customer => customer.role === role);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      roleCustomers = roleCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower)
      );
    }

    return roleCustomers;
  };

  const renderCustomerPage = (role: UserRole) => {
    const roleCustomers = getFilteredCustomersForRole(role);
    
    return (
      <View style={styles.pageContainer} key={role}>
        <CustomerList
          customers={roleCustomers}
          onEditCustomer={onEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          refreshing={refreshing}
          onRefresh={refreshCustomers}
        />
      </View>
    );
  };

  const toggleSearch = () => {
    setIsSearchVisible(prev => {
      if (prev) {
        setSearchTerm('');
      }
      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Manage roles and team access</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleSearch}
            accessibilityLabel={isSearchVisible ? 'Close search' : 'Open search'}
          >
            <Feather
              name={isSearchVisible ? 'x' : 'search'}
              size={20}
              color="#1B6FF9"
            />
          </TouchableOpacity>
        </View>

        {isSearchVisible && (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search customers"
            autoFocus
          />
        )}

        <TabSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />

        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {roles.map(role => renderCustomerPage(role))}
        </PagerView>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={onAddCustomer}
        accessibilityLabel="Add customer"
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F7',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1B1F3B',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B778C',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D2DCF3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0071E3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0071E3',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
