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

// Mock React Native components
jest.mock('react-native', () => {
  // Mock specific components that are commonly used
  const mockComponent = (name) => {
    const Component = function(props) {
      return props.children || null;
    };
    Component.displayName = name;
    return Component;
  };

  return {
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    NativeModules: {
      DevMenu: {},
    },
    // Mock commonly used components
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    FlatList: mockComponent('FlatList'),
    SafeAreaView: mockComponent('SafeAreaView'),
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    // Add other commonly used React Native exports
    Animated: {
      View: mockComponent('Animated.View'),
      Text: mockComponent('Animated.Text'),
      Value: jest.fn(),
      timing: jest.fn(),
      spring: jest.fn(),
      decay: jest.fn(),
      sequence: jest.fn(),
      parallel: jest.fn(),
      stagger: jest.fn(),
      loop: jest.fn(),
      event: jest.fn(),
      createAnimatedComponent: jest.fn(),
    },
    PanResponder: {
      create: jest.fn(),
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((layoutSize) => layoutSize * 2),
      roundToNearestPixel: jest.fn((layoutSize) => Math.round(layoutSize * 2) / 2),
    },
  };
});

// Global fetch mock
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
