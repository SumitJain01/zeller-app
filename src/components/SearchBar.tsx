import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search customers...',
  autoFocus = false,
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      <Feather name="search" size={18} color="#7C8BB6" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={searchTerm}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {searchTerm.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Feather name="x-circle" size={20} color="#7C8BB6" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E3E8F5',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
