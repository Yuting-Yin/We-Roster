import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WarningToast } from '@/components/overlays/WarningToast';

describe('WarningToast', () => {
  const defaultProps = {
    visible: true,
    message: 'Warning: This action cannot be undone',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<WarningToast {...defaultProps} />);
    
    expect(getByText('Warning: This action cannot be undone')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<WarningToast {...defaultProps} visible={false} />);
    
    expect(queryByText('Warning: This action cannot be undone')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<WarningToast {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after specified duration', async () => {
    const { getByText } = render(<WarningToast {...defaultProps} duration={100} />);
    
    expect(getByText('Warning: This action cannot be undone')).toBeTruthy();
    
    // Wait for auto-close
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('should not auto-close when duration is 0', async () => {
    const { getByText } = render(<WarningToast {...defaultProps} duration={0} />);
    
    expect(getByText('Warning: This action cannot be undone')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should not auto-close when duration is negative', async () => {
    const { getByText } = render(<WarningToast {...defaultProps} duration={-100} />);
    
    expect(getByText('Warning: This action cannot be undone')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should display custom message', () => {
    const { getByText } = render(
      <WarningToast {...defaultProps} message="Custom warning message" />
    );
    
    expect(getByText('Custom warning message')).toBeTruthy();
  });

  it('should handle empty message', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} message="" />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle undefined message', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} message={undefined} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle null message', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} message={null} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle long messages', () => {
    const longMessage = 'This is a very long warning message that should be displayed properly in the toast component. '.repeat(5);
    
    const { getByText } = render(
      <WarningToast {...defaultProps} message={longMessage} />
    );
    
    expect(getByText(longMessage)).toBeTruthy();
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Warning! ⚠️ Operation may fail with special chars: @#$%^&*()';
    
    const { getByText } = render(
      <WarningToast {...defaultProps} message={specialMessage} />
    );
    
    expect(getByText(specialMessage)).toBeTruthy();
  });

  it('should handle multiline messages', () => {
    const multilineMessage = 'Line 1\nLine 2\nLine 3';
    
    const { getByText } = render(
      <WarningToast {...defaultProps} message={multilineMessage} />
    );
    
    expect(getByText(multilineMessage)).toBeTruthy();
  });

  it('should handle custom style', () => {
    const customStyle = { backgroundColor: 'orange', borderRadius: 10 };
    
    const { getByTestId } = render(
      <WarningToast {...defaultProps} style={customStyle} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toHaveStyle(customStyle);
  });

  it('should handle custom text style', () => {
    const customTextStyle = { color: 'red', fontSize: 16 };
    
    const { getByTestId } = render(
      <WarningToast {...defaultProps} textStyle={customTextStyle} />
    );
    
    const text = getByTestId('warning-toast-text');
    expect(text).toHaveStyle(customTextStyle);
  });

  it('should handle custom icon', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} icon="warning" />
    );
    
    const icon = getByTestId('warning-toast-icon');
    expect(icon).toBeTruthy();
  });

  it('should handle custom icon color', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} iconColor="orange" />
    );
    
    const icon = getByTestId('warning-toast-icon');
    expect(icon).toHaveStyle({ color: 'orange' });
  });

  it('should handle custom position', () => {
    const { getByTestId, rerender } = render(<WarningToast {...defaultProps} />);
    
    const positions = ['top', 'bottom', 'center'];
    
    positions.forEach(position => {
      rerender(<WarningToast {...defaultProps} position={position} />);
      
      const toast = getByTestId('warning-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation', () => {
    const { getByTestId, rerender } = render(<WarningToast {...defaultProps} />);
    
    const animations = ['fade', 'slide', 'scale'];
    
    animations.forEach(animation => {
      rerender(<WarningToast {...defaultProps} animation={animation} />);
      
      const toast = getByTestId('warning-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation duration', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} animationDuration={500} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle custom z-index', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} zIndex={9999} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toHaveStyle({ zIndex: 9999 });
  });

  it('should handle custom opacity', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} opacity={0.8} />
    );
    
    const toast = getByTestId('warning-toast');
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
      <WarningToast {...defaultProps} shadow={customShadow} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toHaveStyle(customShadow);
  });

  it('should handle custom border', () => {
    const customBorder = {
      borderWidth: 2,
      borderColor: 'orange',
      borderRadius: 8,
    };
    
    const { getByTestId } = render(
      <WarningToast {...defaultProps} border={customBorder} />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toHaveStyle(customBorder);
  });

  it('should handle custom background color', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} backgroundColor="lightyellow" />
    );
    
    const toast = getByTestId('warning-toast');
    expect(toast).toHaveStyle({ backgroundColor: 'lightyellow' });
  });

  it('should handle custom text color', () => {
    const { getByTestId } = render(
      <WarningToast {...defaultProps} textColor="darkorange" />
    );
    
    const text = getByTestId('warning-toast-text');
    expect(text).toHaveStyle({ color: 'darkorange' });
  });
});