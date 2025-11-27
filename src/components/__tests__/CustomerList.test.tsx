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
    // Ensure Alert.alert is a jest mock we can assert on
    // (jest.setup.js provides a default mock implementation)
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
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
    const {getAllByText} = render(
      <CustomerList
        customers={mockCustomers}
        onEditCustomer={mockOnEditCustomer}
        onDeleteCustomer={mockOnDeleteCustomer}
      />
    );

    // There may be multiple matches for "J" (e.g. header + names),
    // we just need at least one section header present.
    const headers = getAllByText('J');
    expect(headers.length).toBeGreaterThan(0);
  });
});
