import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {CustomerList} from '../CustomerList';
import {ZellerCustomer} from '../../types';

describe('CustomerList', () => {
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

  const mockOnEditCustomer = jest.fn();
  const mockOnDeleteCustomer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render customer list correctly', () => {
    const {getByText} = render(
      <CustomerList
        customers={mockCustomers}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Admin')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Manager')).toBeTruthy();
  });

  it('should display empty message when no customers', () => {
    const {getByText} = render(
      <CustomerList
        customers={[]}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    expect(getByText('No customers found')).toBeTruthy();
  });

  it('should call onEditCustomer when a customer row is pressed', () => {
    const {getByText} = render(
      <CustomerList
        customers={mockCustomers}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    fireEvent.press(getByText('John Doe'));

    expect(mockOnEditCustomer).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('should show delete confirmation when a customer row is long pressed', () => {
    const alertSpy = Alert.alert as jest.Mock;
    alertSpy.mockClear();
    const {getByText} = render(
      <CustomerList
        customers={mockCustomers}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    fireEvent(getByText('John Doe'), 'longPress');

    expect(alertSpy).toHaveBeenCalled();
  });

  it('should render section headers', () => {
    const {getByText} = render(
      <CustomerList
        customers={mockCustomers}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    expect(getByText('J')).toBeTruthy();
  });
});
