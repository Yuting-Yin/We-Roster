import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Chip } from '@/components/common/Chip';

describe('Chip', () => {
  const defaultProps = {
    label: 'Test Chip',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    const { getByText } = render(<Chip {...defaultProps} />);
    
    expect(getByText('Test Chip')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByTestId } = render(<Chip {...defaultProps} />);
    
    const chip = getByTestId('chip');
    fireEvent.press(chip);
    
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('should render with custom label', () => {
    const { getByText } = render(<Chip {...defaultProps} label="Custom Label" />);
    
    expect(getByText('Custom Label')).toBeTruthy();
  });

  it('should render with different variants', () => {
    const { getByTestId, rerender } = render(<Chip {...defaultProps} variant="primary" />);
    
    let chip = getByTestId('chip');
    expect(chip).toBeTruthy();
    
    rerender(<Chip {...defaultProps} variant="secondary" />);
    chip = getByTestId('chip');
    expect(chip).toBeTruthy();
    
    rerender(<Chip {...defaultProps} variant="outline" />);
    chip = getByTestId('chip');
    expect(chip).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByTestId, rerender } = render(<Chip {...defaultProps} size="small" />);
    
    let chip = getByTestId('chip');
    expect(chip).toBeTruthy();
    
    rerender(<Chip {...defaultProps} size="medium" />);
    chip = getByTestId('chip');
    expect(chip).toBeTruthy();
    
    rerender(<Chip {...defaultProps} size="large" />);
    chip = getByTestId('chip');
    expect(chip).toBeTruthy();
  });

  it('should render as disabled when disabled prop is true', () => {
    const { getByTestId } = render(<Chip {...defaultProps} disabled={true} />);
    
    const chip = getByTestId('chip');
    expect(chip).toBeTruthy();
    
    // Should not call onPress when disabled
    fireEvent.press(chip);
    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(<Chip {...defaultProps} style={customStyle} />);
    
    const chip = getByTestId('chip');
    expect(chip).toHaveStyle(customStyle);
  });

  it('should render with icon when provided', () => {
    const { getByTestId } = render(<Chip {...defaultProps} icon="star" />);
    
    const icon = getByTestId('chip-icon');
    expect(icon).toBeTruthy();
  });

  it('should render without icon when not provided', () => {
    const { queryByTestId } = render(<Chip {...defaultProps} />);
    
    const icon = queryByTestId('chip-icon');
    expect(icon).toBeNull();
  });

  it('should handle multiple presses', () => {
    const { getByTestId } = render(<Chip {...defaultProps} />);
    
    const chip = getByTestId('chip');
    fireEvent.press(chip);
    fireEvent.press(chip);
    fireEvent.press(chip);
    
    expect(defaultProps.onPress).toHaveBeenCalledTimes(3);
  });

  it('should render with selected state', () => {
    const { getByTestId } = render(<Chip {...defaultProps} selected={true} />);
    
    const chip = getByTestId('chip');
    expect(chip).toBeTruthy();
  });

  it('should render with unselected state', () => {
    const { getByTestId } = render(<Chip {...defaultProps} selected={false} />);
    
    const chip = getByTestId('chip');
    expect(chip).toBeTruthy();
  });
});
