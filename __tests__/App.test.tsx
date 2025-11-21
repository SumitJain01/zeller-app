/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockDatabaseInstance = {
  initDatabase: jest.fn().mockResolvedValue(undefined),
  testDatabaseConnection: jest.fn().mockResolvedValue(true),
  testInsertSingleCustomer: jest.fn().mockResolvedValue(undefined),
  getAllCustomers: jest.fn().mockResolvedValue([]),
  getCustomerCount: jest.fn().mockResolvedValue(0),
  insertCustomers: jest.fn().mockResolvedValue(undefined),
  insertCustomer: jest.fn().mockResolvedValue(undefined),
  updateCustomer: jest.fn().mockResolvedValue(undefined),
  deleteCustomer: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../src/database/DatabaseService', () => ({
  DatabaseService: {
    getInstance: () => mockDatabaseInstance,
  },
}));

jest.mock('../src/services/GraphQLService', () => ({
  GraphQLService: {
    fetchAllCustomers: jest.fn().mockResolvedValue({items: []}),
    createCustomer: jest.fn().mockResolvedValue({
      id: 'mock-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'Admin',
    }),
    updateCustomer: jest.fn().mockResolvedValue({
      id: 'mock-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'Admin',
    }),
    deleteCustomer: jest.fn().mockResolvedValue('mock-id'),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
