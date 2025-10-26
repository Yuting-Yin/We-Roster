// import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  CommonActions: {
    reset: jest.fn(),
  },
}));

// Mock React Native primitives while preserving default implementations
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const emptyModule = {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
    dismiss: jest.fn(),
    reload: jest.fn(),
    show: jest.fn(),
    setCallback: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      get: jest.fn(() => emptyModule),
      getEnforcing: jest.fn(() => emptyModule),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    get: jest.fn(() => emptyModule),
    getEnforcing: jest.fn(() => emptyModule),
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  const createAnimationMock = () => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  });

  const mockedModule = {
    ...RN,
    Alert: { alert: jest.fn() },
    Platform: RN.Platform,
    Dimensions: {
      ...RN.Dimensions,
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => createAnimationMock()),
      spring: jest.fn(() => createAnimationMock()),
      decay: jest.fn(() => createAnimationMock()),
      sequence: jest.fn(() => createAnimationMock()),
      parallel: jest.fn(() => createAnimationMock()),
      loop: jest.fn(() => createAnimationMock()),
    },
    PanResponder: {
      ...RN.PanResponder,
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
    NativeModules: {
      ...RN.NativeModules,
      DevMenu: {},
    },
  };

  return mockedModule;
});

// Global fetch mock
global.fetch = jest.fn();

// Post-mock tweaks for Platform utilities
const RN = require('react-native');

Object.defineProperty(RN.Platform, 'OS', {
  value: 'ios',
  configurable: true,
});

if (typeof RN.Platform.select === 'function') {
  jest.spyOn(RN.Platform, 'select').mockImplementation((options) => {
    if (!options) return undefined;
    return options.ios ?? options.default ?? Object.values(options)[0];
  });
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
