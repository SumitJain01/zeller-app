// Jest setup for React Native

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{rows: {length: 0, item: jest.fn()}}])),
    transaction: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock react-native-pager-view
jest.mock('react-native-pager-view', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    const MockPagerView = require('react-native').View;
    return React.createElement(MockPagerView, props);
  });
});

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  gql: jest.fn(),
  createHttpLink: jest.fn(),
}));

// Mock vector icons
jest.mock('react-native-vector-icons/Feather', () => 'Feather');

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const ReactNative = require('react-native');
ReactNative.Alert = {
  alert: jest.fn(),
};

// Mock console.warn to suppress warnings in tests
global.console.warn = jest.fn();
