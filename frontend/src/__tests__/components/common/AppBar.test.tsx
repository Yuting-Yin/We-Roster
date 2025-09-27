import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppBar } from '@/components/common/AppBar';

describe('AppBar', () => {
  const defaultProps = {
    title: 'Test Title',
    onPressBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with title', () => {
    const { getByText } = render(<AppBar {...defaultProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('should call onPressBack when back button is pressed', () => {
    const { getByTestId } = render(<AppBar {...defaultProps} />);
    
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    
    expect(defaultProps.onPressBack).toHaveBeenCalledTimes(1);
  });

  it('should render with custom title', () => {
    const { getByText } = render(<AppBar {...defaultProps} title="Custom Title" />);
    
    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('should render without back button when onPressBack is not provided', () => {
    const { queryByTestId } = render(<AppBar title="Test Title" />);
    
    expect(queryByTestId('back-button')).toBeNull();
  });

  it('should render with back button when onPressBack is provided', () => {
    const { getByTestId } = render(<AppBar {...defaultProps} />);
    
    expect(getByTestId('back-button')).toBeTruthy();
  });

  it('should handle multiple back button presses', () => {
    const { getByTestId } = render(<AppBar {...defaultProps} />);
    
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    fireEvent.press(backButton);
    fireEvent.press(backButton);
    
    expect(defaultProps.onPressBack).toHaveBeenCalledTimes(3);
  });
});
