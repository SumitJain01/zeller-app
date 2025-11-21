import React, {useMemo} from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {ZellerCustomer} from '../types';

interface CustomerListProps {
  customers: ZellerCustomer[];
  onEditCustomer: (customer: ZellerCustomer) => void;
  onDeleteCustomer: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface CustomerItemProps {
  customer: ZellerCustomer;
  onEdit: () => void;
  onDelete: () => void;
}

interface CustomerSection {
  title: string;
  data: ZellerCustomer[];
}

const getInitial = (name: string) => {
  const trimmed = name?.trim();
  if (!trimmed) {
    return '#';
  }
  const firstChar = trimmed.charAt(0).toUpperCase();
  return firstChar.match(/[A-Z]/) ? firstChar : '#';
};

const buildSections = (customers: ZellerCustomer[]): CustomerSection[] => {
  if (!customers.length) {
    return [];
  }

  const sorted = [...customers].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {sensitivity: 'base'})
  );

  const mapped: Record<string, ZellerCustomer[]> = {};
  sorted.forEach(customer => {
    const key = getInitial(customer.name);
    if (!mapped[key]) {
      mapped[key] = [];
    }
    mapped[key].push(customer);
  });

  return Object.keys(mapped)
    .sort((a, b) => {
      if (a === '#') {
        return 1;
      }
      if (b === '#') {
        return -1;
      }
      return a.localeCompare(b);
    })
    .map(key => ({title: key, data: mapped[key]}));
};

const CustomerItem: React.FC<CustomerItemProps> = ({customer, onEdit, onDelete}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: onDelete},
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.customerItem}
      activeOpacity={0.9}
      onPress={onEdit}
      onLongPress={handleDelete}
      delayLongPress={250}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(customer.name)}</Text>
      </View>
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text
        style={[
          styles.roleText,
          customer.role === 'Admin' ? styles.adminRole : styles.managerRole,
        ]}
      >
        {customer.role}
      </Text>
    </TouchableOpacity>
  );
};

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEditCustomer,
  onDeleteCustomer,
  refreshing = false,
  onRefresh,
}) => {
  const sections = useMemo(() => buildSections(customers), [customers]);

  const renderCustomer = ({item}: {item: ZellerCustomer}) => (
    <CustomerItem
      customer={item}
      onEdit={() => onEditCustomer(item)}
      onDelete={() => onDeleteCustomer(item.id)}
    />
  );

  if (customers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No customers found</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderCustomer}
      renderSectionHeader={({section}) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      keyExtractor={item => item.id}
      style={styles.list}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        ) : undefined
      }
      ListFooterComponent={<View style={{height: 48}} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E7F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B6FF9',
  },
  customerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2933',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminRole: {
    color: '#5B6C94',
  },
  managerRole: {
    color: '#5B6C94',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#F8F9FB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9AA7C8',
  },
  sectionSeparator: {
    height: 12,
  },
  itemSeparator: {
    height: 1,
    marginLeft: 80,
    backgroundColor: '#EEF1F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
