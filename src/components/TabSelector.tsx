import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {UserRole} from '../types';

interface TabSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const tabs: {role: UserRole; label: string}[] = [
  {role: 'All', label: 'All'},
  {role: 'Admin', label: 'Admin'},
  {role: 'Manager', label: 'Manager'},
];

export const TabSelector: React.FC<TabSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        {tabs.map(tab => {
          const isActive = selectedRole === tab.role;

          return (
            <TouchableOpacity
              key={tab.role}
              style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
              onPress={() => onRoleChange(tab.role)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F5FB',
    borderRadius: 999,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#E7EFFC',
    borderWidth: 1,
    borderColor: '#1B6FF9',
    shadowColor: '#1B6FF9',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inactiveTabText: {
    color: '#6B778C',
  },
  activeTabText: {
    color: '#1B6FF9',
  },
});
