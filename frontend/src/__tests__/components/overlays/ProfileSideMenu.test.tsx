import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileSideMenu } from '@/components/overlays/ProfileSideMenu';

describe('ProfileSideMenu', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onLogout: jest.fn(),
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      designation: 'Nurse',
      department: 'Emergency',
      avatar: 'https://example.com/avatar.jpg',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<ProfileSideMenu {...defaultProps} />);
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
    expect(getByText('Nurse')).toBeTruthy();
    expect(getByText('Emergency')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<ProfileSideMenu {...defaultProps} visible={false} />);
    
    expect(queryByText('John Doe')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<ProfileSideMenu {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onLogout when logout button is pressed', () => {
    const { getByTestId } = render(<ProfileSideMenu {...defaultProps} />);
    
    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);
    
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  it('should display user avatar when provided', () => {
    const { getByTestId } = render(<ProfileSideMenu {...defaultProps} />);
    
    const avatar = getByTestId('user-avatar');
    expect(avatar).toBeTruthy();
    expect(avatar.props.source.uri).toBe('https://example.com/avatar.jpg');
  });

  it('should display user initials when no avatar is provided', () => {
    const userWithoutAvatar = { ...defaultProps.user, avatar: null };
    
    const { getByText } = render(
      <ProfileSideMenu {...defaultProps} user={userWithoutAvatar} />
    );
    
    expect(getByText('JD')).toBeTruthy();
  });

  it('should handle user without designation', () => {
    const userWithoutDesignation = { ...defaultProps.user, designation: null };
    
    const { queryByText } = render(
      <ProfileSideMenu {...defaultProps} user={userWithoutDesignation} />
    );
    
    expect(queryByText('Nurse')).toBeNull();
  });

  it('should handle user without department', () => {
    const userWithoutDepartment = { ...defaultProps.user, department: null };
    
    const { queryByText } = render(
      <ProfileSideMenu {...defaultProps} user={userWithoutDepartment} />
    );
    
    expect(queryByText('Emergency')).toBeNull();
  });

  it('should handle menu item selection', () => {
    const menuItems = [
      { id: 'profile', title: 'Profile', icon: 'user' },
      { id: 'settings', title: 'Settings', icon: 'settings' },
      { id: 'help', title: 'Help', icon: 'help' },
    ];

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} menuItems={menuItems} />
    );
    
    const profileItem = getByTestId('menu-item-profile');
    fireEvent.press(profileItem);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle custom menu items', () => {
    const customMenuItems = [
      { id: 'custom1', title: 'Custom Item 1', icon: 'star' },
      { id: 'custom2', title: 'Custom Item 2', icon: 'heart' },
    ];

    const { getByText } = render(
      <ProfileSideMenu {...defaultProps} menuItems={customMenuItems} />
    );
    
    expect(getByText('Custom Item 1')).toBeTruthy();
    expect(getByText('Custom Item 2')).toBeTruthy();
  });

  it('should handle menu item with onPress callback', () => {
    const onMenuItemPress = jest.fn();
    const menuItems = [
      { id: 'profile', title: 'Profile', icon: 'user', onPress: onMenuItemPress },
    ];

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} menuItems={menuItems} />
    );
    
    const profileItem = getByTestId('menu-item-profile');
    fireEvent.press(profileItem);
    
    expect(onMenuItemPress).toHaveBeenCalledTimes(1);
  });

  it('should handle menu item with badge', () => {
    const menuItems = [
      { id: 'notifications', title: 'Notifications', icon: 'bell', badge: 5 },
    ];

    const { getByText } = render(
      <ProfileSideMenu {...defaultProps} menuItems={menuItems} />
    );
    
    expect(getByText('5')).toBeTruthy();
  });

  it('should handle menu item with disabled state', () => {
    const menuItems = [
      { id: 'disabled', title: 'Disabled Item', icon: 'lock', disabled: true },
    ];

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} menuItems={menuItems} />
    );
    
    const disabledItem = getByTestId('menu-item-disabled');
    expect(disabledItem).toBeTruthy();
    
    // Should not call onClose when disabled item is pressed
    fireEvent.press(disabledItem);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should handle custom styles', () => {
    const customStyle = { backgroundColor: 'white', borderRadius: 10 };
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} style={customStyle} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu).toHaveStyle(customStyle);
  });

  it('should handle custom title', () => {
    const { getByText } = render(
      <ProfileSideMenu {...defaultProps} title="Custom Profile Menu" />
    );
    
    expect(getByText('Custom Profile Menu')).toBeTruthy();
  });

  it('should handle custom buttons', () => {
    const customButtons = {
      logout: { text: 'Sign Out', style: { backgroundColor: 'red' } },
      close: { text: 'Close Menu', style: { backgroundColor: 'gray' } },
    };

    const { getByText } = render(
      <ProfileSideMenu {...defaultProps} buttons={customButtons} />
    );
    
    expect(getByText('Sign Out')).toBeTruthy();
    expect(getByText('Close Menu')).toBeTruthy();
  });

  it('should handle custom options', () => {
    const customOptions = {
      showAvatar: true,
      showDesignation: true,
      showDepartment: true,
      showEmail: true,
    };

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} options={customOptions} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu).toBeTruthy();
  });

  it('should handle custom animation', () => {
    const { getByTestId, rerender } = render(<ProfileSideMenu {...defaultProps} />);
    
    const animations = ['slide', 'fade', 'scale'];
    
    animations.forEach(animation => {
      rerender(<ProfileSideMenu {...defaultProps} animation={animation} />);
      
      const menu = getByTestId('profile-side-menu');
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
      <ProfileSideMenu {...defaultProps} theme={customTheme} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu).toBeTruthy();
  });

  it('should handle custom accessibility', () => {
    const customAccessibility = {
      accessibilityLabel: 'User profile menu',
      accessibilityHint: 'Double tap to close menu',
      accessibilityRole: 'menu',
    };

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} accessibility={customAccessibility} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu.props.accessibilityLabel).toBe('User profile menu');
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
      <ProfileSideMenu {...defaultProps} accessibilityState={customAccessibilityState} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu.props.accessibilityState).toEqual(customAccessibilityState);
  });

  it('should handle custom accessibility value', () => {
    const customAccessibilityValue = {
      text: 'Profile menu open',
      min: 0,
      max: 100,
      now: 50,
    };

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} accessibilityValue={customAccessibilityValue} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu.props.accessibilityValue).toEqual(customAccessibilityValue);
  });

  it('should handle custom accessibility actions', () => {
    const customAccessibilityActions = [
      { name: 'activate' },
      { name: 'longpress' },
    ];

    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} accessibilityActions={customAccessibilityActions} />
    );
    
    const menu = getByTestId('profile-side-menu');
    expect(menu.props.accessibilityActions).toEqual(customAccessibilityActions);
  });

  it('should handle custom accessibility onAccessibilityAction', () => {
    const onAccessibilityAction = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onAccessibilityAction={onAccessibilityAction} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onAccessibilityAction', { nativeEvent: { actionName: 'activate' } });
    
    expect(onAccessibilityAction).toHaveBeenCalledWith({ nativeEvent: { actionName: 'activate' } });
  });

  it('should handle custom accessibility onAccessibilityEscape', () => {
    const onAccessibilityEscape = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onAccessibilityEscape={onAccessibilityEscape} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onAccessibilityEscape');
    
    expect(onAccessibilityEscape).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityTap', () => {
    const onAccessibilityTap = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onAccessibilityTap={onAccessibilityTap} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onAccessibilityTap');
    
    expect(onAccessibilityTap).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onMagicTap', () => {
    const onMagicTap = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onMagicTap={onMagicTap} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onMagicTap');
    
    expect(onMagicTap).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityFocus', () => {
    const onAccessibilityFocus = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onAccessibilityFocus={onAccessibilityFocus} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onAccessibilityFocus');
    
    expect(onAccessibilityFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle custom accessibility onAccessibilityBlur', () => {
    const onAccessibilityBlur = jest.fn();
    
    const { getByTestId } = render(
      <ProfileSideMenu {...defaultProps} onAccessibilityBlur={onAccessibilityBlur} />
    );
    
    const menu = getByTestId('profile-side-menu');
    fireEvent(menu, 'onAccessibilityBlur');
    
    expect(onAccessibilityBlur).toHaveBeenCalledTimes(1);
  });
});