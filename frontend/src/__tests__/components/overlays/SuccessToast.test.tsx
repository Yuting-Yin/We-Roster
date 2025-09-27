import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SuccessToast } from '@/components/overlays/SuccessToast';

describe('SuccessToast', () => {
  const defaultProps = {
    visible: true,
    message: 'Operation completed successfully',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<SuccessToast {...defaultProps} />);
    
    expect(getByText('Operation completed successfully')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<SuccessToast {...defaultProps} visible={false} />);
    
    expect(queryByText('Operation completed successfully')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<SuccessToast {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after specified duration', async () => {
    const { getByText } = render(<SuccessToast {...defaultProps} duration={100} />);
    
    expect(getByText('Operation completed successfully')).toBeTruthy();
    
    // Wait for auto-close
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('should not auto-close when duration is 0', async () => {
    const { getByText } = render(<SuccessToast {...defaultProps} duration={0} />);
    
    expect(getByText('Operation completed successfully')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should not auto-close when duration is negative', async () => {
    const { getByText } = render(<SuccessToast {...defaultProps} duration={-100} />);
    
    expect(getByText('Operation completed successfully')).toBeTruthy();
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should display custom message', () => {
    const { getByText } = render(
      <SuccessToast {...defaultProps} message="Custom success message" />
    );
    
    expect(getByText('Custom success message')).toBeTruthy();
  });

  it('should handle empty message', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} message="" />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle undefined message', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} message={undefined} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle null message', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} message={null} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle long messages', () => {
    const longMessage = 'This is a very long success message that should be displayed properly in the toast component. '.repeat(5);
    
    const { getByText } = render(
      <SuccessToast {...defaultProps} message={longMessage} />
    );
    
    expect(getByText(longMessage)).toBeTruthy();
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Success! 🎉 Operation completed with special chars: @#$%^&*()';
    
    const { getByText } = render(
      <SuccessToast {...defaultProps} message={specialMessage} />
    );
    
    expect(getByText(specialMessage)).toBeTruthy();
  });

  it('should handle multiline messages', () => {
    const multilineMessage = 'Line 1\nLine 2\nLine 3';
    
    const { getByText } = render(
      <SuccessToast {...defaultProps} message={multilineMessage} />
    );
    
    expect(getByText(multilineMessage)).toBeTruthy();
  });

  it('should handle custom style', () => {
    const customStyle = { backgroundColor: 'red', borderRadius: 10 };
    
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} style={customStyle} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toHaveStyle(customStyle);
  });

  it('should handle custom text style', () => {
    const customTextStyle = { color: 'blue', fontSize: 16 };
    
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} textStyle={customTextStyle} />
    );
    
    const text = getByTestId('success-toast-text');
    expect(text).toHaveStyle(customTextStyle);
  });

  it('should handle custom icon', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} icon="check-circle" />
    );
    
    const icon = getByTestId('success-toast-icon');
    expect(icon).toBeTruthy();
  });

  it('should handle custom icon color', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} iconColor="green" />
    );
    
    const icon = getByTestId('success-toast-icon');
    expect(icon).toHaveStyle({ color: 'green' });
  });

  it('should handle custom position', () => {
    const { getByTestId, rerender } = render(<SuccessToast {...defaultProps} />);
    
    const positions = ['top', 'bottom', 'center'];
    
    positions.forEach(position => {
      rerender(<SuccessToast {...defaultProps} position={position} />);
      
      const toast = getByTestId('success-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation', () => {
    const { getByTestId, rerender } = render(<SuccessToast {...defaultProps} />);
    
    const animations = ['fade', 'slide', 'scale'];
    
    animations.forEach(animation => {
      rerender(<SuccessToast {...defaultProps} animation={animation} />);
      
      const toast = getByTestId('success-toast');
      expect(toast).toBeTruthy();
    });
  });

  it('should handle custom animation duration', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} animationDuration={500} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toBeTruthy();
  });

  it('should handle custom z-index', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} zIndex={9999} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toHaveStyle({ zIndex: 9999 });
  });

  it('should handle custom opacity', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} opacity={0.8} />
    );
    
    const toast = getByTestId('success-toast');
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
      <SuccessToast {...defaultProps} shadow={customShadow} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toHaveStyle(customShadow);
  });

  it('should handle custom border', () => {
    const customBorder = {
      borderWidth: 2,
      borderColor: 'green',
      borderRadius: 8,
    };
    
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} border={customBorder} />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toHaveStyle(customBorder);
  });

  it('should handle custom background color', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} backgroundColor="lightgreen" />
    );
    
    const toast = getByTestId('success-toast');
    expect(toast).toHaveStyle({ backgroundColor: 'lightgreen' });
  });

  it('should handle custom text color', () => {
    const { getByTestId } = render(
      <SuccessToast {...defaultProps} textColor="darkgreen" />
    );
    
    const text = getByTestId('success-toast-text');
    expect(text).toHaveStyle({ color: 'darkgreen' });
  });
});