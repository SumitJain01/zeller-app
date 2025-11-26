import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useCustomerStore} from '../store/customerStore';
import {ZellerCustomer, FormData, ValidationError} from '../types';
import {ValidationUtils} from '../utils/validation';

interface AddEditCustomerScreenProps {
  customer?: ZellerCustomer;
  onClose: () => void;
}

const splitName = (fullName: string) => {
  if (!fullName) {
    return {first: '', last: ''};
  }

  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return {first: parts[0], last: ''};
  }

  return {
    first: parts.slice(0, -1).join(' '),
    last: parts.slice(-1).join(' '),
  };
};

export const AddEditCustomerScreen: React.FC<AddEditCustomerScreenProps> = ({
  customer,
  onClose,
}) => {
  const {addCustomer, updateCustomer, deleteCustomer} = useCustomerStore();
  const initialNameParts = splitName(customer?.name || '');
  
  const [formData, setFormData] = useState<FormData>({
    name: customer?.name || '',
    email: customer?.email || '',
    role: customer?.role || 'Manager',
  });
  const [firstName, setFirstName] = useState(initialNameParts.first);
  const [lastName, setLastName] = useState(initialNameParts.last);
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!customer;

  useEffect(() => {
    // Clear errors when form data changes
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateFullName = (updatedFirst: string, updatedLast: string) => {
    const fullName = [updatedFirst.trim(), updatedLast.trim()]
      .filter(Boolean)
      .join(' ');
    handleInputChange('name', fullName);
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    updateFullName(value, lastName);
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    updateFullName(firstName, value);
  };

  const handleRoleSelect = (role: 'Admin' | 'Manager') => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  const validateAndSubmit = async () => {
    const validationErrors = ValidationUtils.validateForm(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode && customer) {
        await updateCustomer({
          ...customer,
          ...formData,
        });
      } else {
        await addCustomer(formData);
      }
      
      Alert.alert(
        'Success',
        `Customer ${isEditMode ? 'updated' : 'added'} successfully!`,
        [
          {
            text: 'OK',
            onPress: onClose,
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'add'} customer. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorForField = (field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error?.message;
  };

  const handleDeleteCustomer = () => {
    if (!customer) {
      return;
    }

    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              onClose();
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete customer. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const primaryButtonLabel = isSubmitting
    ? 'Saving...'
    : isEditMode
    ? 'Save Changes'
    : 'Create User';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityLabel="Close form">
            <Feather name="x" size={20} color="#1B1F3B" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditMode ? 'Edit User' : 'New User'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={[
                styles.textField,
                getErrorForField('name') && styles.textFieldError,
              ]}
              value={firstName}
              onChangeText={handleFirstNameChange}
              placeholder="First Name"
              placeholderTextColor="#B4BCCB"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.textField}
              value={lastName}
              onChangeText={handleLastNameChange}
              placeholder="Last Name"
              placeholderTextColor="#B4BCCB"
            />
          </View>

          {getErrorForField('name') && (
            <Text style={styles.errorText}>{getErrorForField('name')}</Text>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[
                styles.textField,
                getErrorForField('email') && styles.textFieldError,
              ]}
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              placeholder="Email"
              placeholderTextColor="#B4BCCB"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {getErrorForField('email') && (
              <Text style={styles.errorText}>{getErrorForField('email')}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>User Role</Text>
            <View style={styles.roleSegment}>
              {(['Admin', 'Manager'] as const).map(roleOption => {
                const isActive = formData.role === roleOption;
                return (
                  <TouchableOpacity
                    key={roleOption}
                    style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                    onPress={() => handleRoleSelect(roleOption)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {roleOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {getErrorForField('role') && (
              <Text style={styles.errorText}>{getErrorForField('role')}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={validateAndSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCustomer}
            disabled={isSubmitting}
          >
            <Text style={styles.deleteButtonText}>Delete User</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#2F3A4C',
    fontWeight: '500',
  },
  textField: {
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  textFieldError: {
    borderBottomColor: '#F97066',
  },
  errorText: {
    fontSize: 13,
    color: '#F97066',
    marginTop: -12,
    marginBottom: 8,
  },
  roleSegment: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FB',
    borderRadius: 999,
    padding: 4,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#E6F1FF',
    borderWidth: 1,
    borderColor: '#1B6FF9',
    shadowColor: '#1B6FF9',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#1B6FF9',
  },
  primaryButton: {
    marginTop: 32,
    marginHorizontal: 24,
    backgroundColor: '#0071E3',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    marginTop: 16,
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F97373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});
