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
    return React.createElement(MockPagerView, {...props, ref});
  });
});

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  gql: jest.fn(),
  createHttpLink: jest.fn(),
}));

// Mock vector icons (Feather) with loadFont
jest.mock('react-native-vector-icons/Feather', () => {
  const MockIcon = () => null;
  MockIcon.loadFont = jest.fn(() => Promise.resolve());
  return MockIcon;
});

// Ensure Alert is available from 'react-native'
const ReactNative = require('react-native');
ReactNative.Alert = {
  alert: jest.fn(),
};

// Mock react-native-reanimated (v3) for Jest (avoid ESM mock file)
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const {View} = require('react-native');

  const Animated = {
    View: React.forwardRef((props, ref) => React.createElement(View, {...props, ref})),
  };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    // Minimal implementations used in the app
    useSharedValue: jest.fn(initial => ({value: initial})),
    useAnimatedStyle: jest.fn(fn => fn()),
    withTiming: (value, _config) => value,
    Easing: {
      out: fn => fn,
      quad: jest.fn(),
    },
  };
});

// Mock console.warn to suppress warnings in tests
global.console.warn = jest.fn();
