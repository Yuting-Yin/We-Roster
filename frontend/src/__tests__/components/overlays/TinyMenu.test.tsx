import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TinyMenu } from '@/components/overlays/TinyMenu';

describe('TinyMenu', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    items: [
      { id: 'item1', title: 'Item 1', icon: 'star' },
      { id: 'item2', title: 'Item 2', icon: 'heart' },
      { id: 'item3', title: 'Item 3', icon: 'settings' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<TinyMenu {...defaultProps} />);
    
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<TinyMenu {...defaultProps} visible={false} />);
    
    expect(queryByText('Item 1')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<TinyMenu {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle item selection', () => {
    const onItemPress = jest.fn();
    const itemsWithCallback = defaultProps.items.map(item => ({
      ...item,
      onPress: onItemPress,
    }));

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} items={itemsWithCallback} />
    );
    
    const item1 = getByTestId('menu-item-item1');
    fireEvent.press(item1);
    
    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle item with custom onPress', () => {
    const customOnPress = jest.fn();
    const itemsWithCustomCallback = [
      { id: 'custom', title: 'Custom Item', icon: 'star', onPress: customOnPress },
    ];

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} items={itemsWithCustomCallback} />
    );
    
    const customItem = getByTestId('menu-item-custom');
    fireEvent.press(customItem);
    
    expect(customOnPress).toHaveBeenCalledTimes(1);
  });

  it('should handle item with badge', () => {
    const itemsWithBadge = [
      { id: 'badge', title: 'Item with Badge', icon: 'bell', badge: 5 },
    ];

    const { getByText } = render(
      <TinyMenu {...defaultProps} items={itemsWithBadge} />
    );
    
    expect(getByText('5')).toBeTruthy();
  });

  it('should handle item with disabled state', () => {
    const itemsWithDisabled = [
      { id: 'disabled', title: 'Disabled Item', icon: 'lock', disabled: true },
    ];

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} items={itemsWithDisabled} />
    );
    
    const disabledItem = getByTestId('menu-item-disabled');
    expect(disabledItem).toBeTruthy();
    
    // Should not call onClose when disabled item is pressed
    fireEvent.press(disabledItem);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should handle item with custom style', () => {
    const itemsWithStyle = [
      { id: 'styled', title: 'Styled Item', icon: 'star', style: { color: 'red' } },
    ];

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} items={itemsWithStyle} />
    );
    
    const styledItem = getByTestId('menu-item-styled');
    expect(styledItem).toHaveStyle({ color: 'red' });
  });

  it('should handle custom styles', () => {
    const customStyle = { backgroundColor: 'white', borderRadius: 10 };
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} style={customStyle} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu).toHaveStyle(customStyle);
  });

  it('should handle custom title', () => {
    const { getByText } = render(
      <TinyMenu {...defaultProps} title="Custom Tiny Menu" />
    );
    
    expect(getByText('Custom Tiny Menu')).toBeTruthy();
  });

  it('should handle custom buttons', () => {
    const customButtons = {
      close: { text: 'Close Menu', style: { backgroundColor: 'gray' } },
    };

    const { getByText } = render(
      <TinyMenu {...defaultProps} buttons={customButtons} />
    );
    
    expect(getByText('Close Menu')).toBeTruthy();
  });

  it('should handle custom options', () => {
    const customOptions = {
      showIcons: true,
      showBadges: true,
      showDividers: true,
    };

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} options={customOptions} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu).toBeTruthy();
  });

  it('should handle custom animation', () => {
    const { getByTestId, rerender } = render(<TinyMenu {...defaultProps} />);
    
    const animations = ['slide', 'fade', 'scale'];
    
    animations.forEach(animation => {
      rerender(<TinyMenu {...defaultProps} animation={animation} />);
      
      const menu = getByTestId('tiny-menu');
      expect(menu).toBeTruthy();
    });
  });

  it('should handle custom theme', () => {
    const customTheme = {
      colors: {
        primary: 'blue',
        secondary: 'gray',
        background: 'white',
        text: 'black',
      },
    };

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} theme={customTheme} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu).toBeTruthy();
  });

  it('should handle custom accessibility', () => {
    const customAccessibility = {
      accessibilityLabel: 'Tiny menu',
      accessibilityHint: 'Double tap to close menu',
      accessibilityRole: 'menu',
    };

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} accessibility={customAccessibility} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu.props.accessibilityLabel).toBe('Tiny menu');
    expect(menu.props.accessibilityHint).toBe('Double tap to close menu');
    expect(menu.props.accessibilityRole).toBe('menu');
  });

  it('should handle custom accessibility state', () => {
    const customAccessibilityState = {
      selected: true,
      disabled: false,
      checked: false,
    };

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} accessibilityState={customAccessibilityState} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu.props.accessibilityState).toEqual(customAccessibilityState);
  });

  it('should handle custom accessibility value', () => {
    const customAccessibilityValue = {
      text: 'Tiny menu open',
      min: 0,
      max: 100,
      now: 50,
    };

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} accessibilityValue={customAccessibilityValue} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu.props.accessibilityValue).toEqual(customAccessibilityValue);
  });

  it('should handle custom accessibility actions', () => {
    const customAccessibilityActions = [
      { name: 'activate' },
      { name: 'longpress' },
    ];

    const { getByTestId } = render(
      <TinyMenu {...defaultProps} accessibilityActions={customAccessibilityActions} />
    );
    
    const menu = getByTestId('tiny-menu');
    expect(menu.props.accessibilityActions).toEqual(customAccessibilityActions);
  });

  it('should handle custom accessibility onAccessibilityAction', () => {
    const onAccessibilityAction = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onAccessibilityAction={onAccessibilityAction} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onAccessibilityAction', { nativeEvent: { actionName: 'activate' } });
    
    expect(onAccessibilityAction).toHaveBeenCalledWith({ nativeEvent: { actionName: 'activate' } });
  });

  it('should handle custom accessibility onAccessibilityEscape', () => {
    const onAccessibilityEscape = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onAccessibilityEscape={onAccessibilityEscape} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onAccessibilityEscape');
    
    expect(onAccessibilityEscape).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityTap', () => {
    const onAccessibilityTap = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onAccessibilityTap={onAccessibilityTap} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onAccessibilityTap');
    
    expect(onAccessibilityTap).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onMagicTap', () => {
    const onMagicTap = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onMagicTap={onMagicTap} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onMagicTap');
    
    expect(onMagicTap).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityFocus', () => {
    const onAccessibilityFocus = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onAccessibilityFocus={onAccessibilityFocus} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onAccessibilityFocus');
    
    expect(onAccessibilityFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityBlur', () => {
    const onAccessibilityBlur = jest.fn();
    
    const { getByTestId } = render(
      <TinyMenu {...defaultProps} onAccessibilityBlur={onAccessibilityBlur} />
    );
    
    const menu = getByTestId('tiny-menu');
    fireEvent(menu, 'onAccessibilityBlur');
    
    expect(onAccessibilityBlur).toHaveBeenCalledTimes(1);
  });
});