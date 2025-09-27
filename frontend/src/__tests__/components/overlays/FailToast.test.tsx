import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FailToast } from '@/components/overlays/FailToast';

describe('FailToast', () => {
  const defaultProps = {
    visible: true,
    message: 'Operation failed. Please try again.',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<FailToast {...defaultProps} />);
    
    expect(getByText('Operation failed. Please try again.')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<FailToast {...defaultProps} visible={false} />);
    
    expect(queryByText('Operation failed. Please try again.')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<FailToast {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after specified duration', async () => {
    const { getByText } = render(<FailToast {...defaultProps} duration={100} />);
    
    expect(getByText('Operation failed. Please try again.')).toBeTruthy();
    
    // Wait for auto-close
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('should not auto-close when duration is 0', async () => {
    const { getByText } = render(<FailToast {...defaultProps} duration={0} />);
    
    expect(getByText('Operation failed. Please try again.')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should not auto-close when duration is negative', async () => {
    const { getByText } = render(<FailToast {...defaultProps} duration={-100} />);
    
    expect(getByText('Operation failed. Please try again.')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should display custom message', () => {
    const { getByText } = render(
      <FailToast {...defaultProps} message="Custom error message" />
    );
    
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('should handle empty message', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} message="" />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle undefined message', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} message={undefined} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle null message', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} message={null} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle long messages', () => {
    const longMessage = 'This is a very long error message that should be displayed properly in the toast component. '.repeat(5);
    
    const { getByText } = render(
      <FailToast {...defaultProps} message={longMessage} />
    );
    
    expect(getByText(longMessage)).toBeTruthy();
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Error! ❌ Operation failed with special chars: @#$%^&*()';
    
    const { getByText } = render(
      <FailToast {...defaultProps} message={specialMessage} />
    );
    
    expect(getByText(specialMessage)).toBeTruthy();
  });

  it('should handle multiline messages', () => {
    const multilineMessage = 'Line 1\nLine 2\nLine 3';
    
    const { getByText } = render(
      <FailToast {...defaultProps} message={multilineMessage} />
    );
    
    expect(getByText(multilineMessage)).toBeTruthy();
  });

  it('should handle custom style', () => {
    const customStyle = { backgroundColor: 'red', borderRadius: 10 };
    
    const { getByTestId } = render(
      <FailToast {...defaultProps} style={customStyle} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle(customStyle);
  });

  it('should handle custom text style', () => {
    const customTextStyle = { color: 'white', fontSize: 16 };
    
    const { getByTestId } = render(
      <FailToast {...defaultProps} textStyle={customTextStyle} />
    );
    
    const text = getByTestId('fail-toast-text');
    expect(text).toHaveStyle(customTextStyle);
  });

  it('should handle custom icon', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} icon="error" />
    );
    
    const icon = getByTestId('fail-toast-icon');
    expect(icon).toBeTruthy();
  });

  it('should handle custom icon color', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} iconColor="red" />
    );
    
    const icon = getByTestId('fail-toast-icon');
    expect(icon).toHaveStyle({ color: 'red' });
  });

  it('should handle custom position', () => {
    const { getByTestId, rerender } = render(<FailToast {...defaultProps} />);
    
    const positions = ['top', 'bottom', 'center'];
    
    positions.forEach(position => {
      rerender(<FailToast {...defaultProps} position={position} />);
      
      const toast = getByTestId('fail-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation', () => {
    const { getByTestId, rerender } = render(<FailToast {...defaultProps} />);
    
    const animations = ['fade', 'slide', 'scale'];
    
    animations.forEach(animation => {
      rerender(<FailToast {...defaultProps} animation={animation} />);
      
      const toast = getByTestId('fail-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation duration', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} animationDuration={500} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle custom z-index', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} zIndex={9999} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle({ zIndex: 9999 });
  });

  it('should handle custom opacity', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} opacity={0.8} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle({ opacity: 0.8 });
  });

  it('should handle custom shadow', () => {
    const customShadow = {
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };
    
    const { getByTestId } = render(
      <FailToast {...defaultProps} shadow={customShadow} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle(customShadow);
  });

  it('should handle custom border', () => {
    const customBorder = {
      borderWidth: 2,
      borderColor: 'red',
      borderRadius: 8,
    };
    
    const { getByTestId } = render(
      <FailToast {...defaultProps} border={customBorder} />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle(customBorder);
  });

  it('should handle custom background color', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} backgroundColor="lightcoral" />
    );
    
    const toast = getByTestId('fail-toast');
    expect(toast).toHaveStyle({ backgroundColor: 'lightcoral' });
  });

  it('should handle custom text color', () => {
    const { getByTestId } = render(
      <FailToast {...defaultProps} textColor="darkred" />
    );
    
    const text = getByTestId('fail-toast-text');
    expect(text).toHaveStyle({ color: 'darkred' });
  });
});