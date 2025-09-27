import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RequestShift } from '@/components/overlays/RequestShift';

// Mock the API
jest.mock('@/api/myroster', () => ({
  requestShift: jest.fn(),
}));

import { requestShift } from '@/api/myroster';

describe('RequestShift', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmitted: jest.fn(),
    shift: {
      id: '1',
      title: 'Morning Shift',
      start: '09:00',
      end: '17:00',
      type: 'shift',
      location: 'Room 101',
      description: 'Regular morning shift',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<RequestShift {...defaultProps} />);
    
    expect(getByText('Request Shift')).toBeTruthy();
    expect(getByText('Morning Shift')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<RequestShift {...defaultProps} visible={false} />);
    
    expect(queryByText('Request Shift')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display shift information', () => {
    const { getByText } = render(<RequestShift {...defaultProps} />);
    
    expect(getByText('Morning Shift')).toBeTruthy();
    expect(getByText('09:00 - 17:00')).toBeTruthy();
    expect(getByText('Room 101')).toBeTruthy();
    expect(getByText('Regular morning shift')).toBeTruthy();
  });

  it('should submit shift request successfully', async () => {
    (requestShift as jest.Mock).mockResolvedValueOnce({ success: true });

    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'I am available for this shift');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1', 'I am available for this shift');
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle request failure', async () => {
    (requestShift as jest.Mock).mockRejectedValueOnce(new Error('Request failed'));

    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'I am available for this shift');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1', 'I am available for this shift');
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should validate required reason field', async () => {
    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Try to submit without reason
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(requestShift).not.toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should show loading state during request', async () => {
    (requestShift as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'I am available for this shift');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    // Check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle shift without location', () => {
    const shiftWithoutLocation = {
      ...defaultProps.shift,
      location: undefined,
    };

    const { queryByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithoutLocation} />
    );
    
    expect(queryByText('Room 101')).toBeNull();
  });

  it('should handle shift without description', () => {
    const shiftWithoutDescription = {
      ...defaultProps.shift,
      description: undefined,
    };

    const { queryByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithoutDescription} />
    );
    
    expect(queryByText('Regular morning shift')).toBeNull();
  });

  it('should handle different shift types', () => {
    const { getByTestId, rerender } = render(<RequestShift {...defaultProps} />);
    
    // Test different shift types
    const shiftTypes = ['shift', 'leave', 'swap'];
    
    shiftTypes.forEach(type => {
      const shiftWithType = {
        ...defaultProps.shift,
        type,
      };
      
      rerender(<RequestShift {...defaultProps} shift={shiftWithType} />);
      
      const shiftDetails = getByTestId('shift-details');
      expect(shiftDetails).toBeTruthy();
    });
  });

  it('should handle shift with custom color', () => {
    const shiftWithColor = {
      ...defaultProps.shift,
      color: 'red',
    };

    const { getByTestId } = render(
      <RequestShift {...defaultProps} shift={shiftWithColor} />
    );
    
    const shiftDetails = getByTestId('shift-details');
    expect(shiftDetails).toHaveStyle({ borderLeftColor: 'red' });
  });

  it('should handle shift with custom style', () => {
    const shiftWithStyle = {
      ...defaultProps.shift,
      style: { borderWidth: 2, borderColor: 'blue' },
    };

    const { getByTestId } = render(
      <RequestShift {...defaultProps} shift={shiftWithStyle} />
    );
    
    const shiftDetails = getByTestId('shift-details');
    expect(shiftDetails).toHaveStyle({ borderWidth: 2, borderColor: 'blue' });
  });

  it('should handle shift with requirements', () => {
    const shiftWithRequirements = {
      ...defaultProps.shift,
      requirements: ['Nursing license', 'CPR certification'],
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithRequirements} />
    );
    
    expect(getByText('Nursing license')).toBeTruthy();
    expect(getByText('CPR certification')).toBeTruthy();
  });

  it('should handle shift with equipment', () => {
    const shiftWithEquipment = {
      ...defaultProps.shift,
      equipment: ['Stethoscope', 'Blood pressure cuff'],
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithEquipment} />
    );
    
    expect(getByText('Stethoscope')).toBeTruthy();
    expect(getByText('Blood pressure cuff')).toBeTruthy();
  });

  it('should handle shift with contact information', () => {
    const shiftWithContact = {
      ...defaultProps.shift,
      contact: {
        name: 'Dr. Smith',
        phone: '555-1234',
        email: 'dr.smith@hospital.com',
      },
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithContact} />
    );
    
    expect(getByText('Dr. Smith')).toBeTruthy();
    expect(getByText('555-1234')).toBeTruthy();
    expect(getByText('dr.smith@hospital.com')).toBeTruthy();
  });

  it('should handle shift with notes', () => {
    const shiftWithNotes = {
      ...defaultProps.shift,
      notes: 'Important notes about this shift',
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithNotes} />
    );
    
    expect(getByText('Important notes about this shift')).toBeTruthy();
  });

  it('should handle shift with priority', () => {
    const shiftWithPriority = {
      ...defaultProps.shift,
      priority: 'high',
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithPriority} />
    );
    
    expect(getByText('High Priority')).toBeTruthy();
  });

  it('should handle shift with status', () => {
    const shiftWithStatus = {
      ...defaultProps.shift,
      status: 'available',
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithStatus} />
    );
    
    expect(getByText('Available')).toBeTruthy();
  });

  it('should handle shift with weather information', () => {
    const shiftWithWeather = {
      ...defaultProps.shift,
      weather: {
        condition: 'Sunny',
        temperature: '22°C',
      },
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithWeather} />
    );
    
    expect(getByText('Sunny')).toBeTruthy();
    expect(getByText('22°C')).toBeTruthy();
  });

  it('should handle shift with traffic information', () => {
    const shiftWithTraffic = {
      ...defaultProps.shift,
      traffic: {
        condition: 'Heavy',
        estimatedTime: '45 minutes',
      },
    };

    const { getByText } = render(
      <RequestShift {...defaultProps} shift={shiftWithTraffic} />
    );
    
    expect(getByText('Heavy')).toBeTruthy();
    expect(getByText('45 minutes')).toBeTruthy();
  });

  it('should clear form after successful submission', async () => {
    (requestShift as jest.Mock).mockResolvedValueOnce({ success: true });

    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'I am available for this shift');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1', 'I am available for this shift');
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });

    // Form should be cleared
    expect(reasonInput.props.value).toBe('');
  });

  it('should handle long reason text', async () => {
    (requestShift as jest.Mock).mockResolvedValueOnce({ success: true });

    const longReason = 'This is a very long reason for requesting this shift. '.repeat(10);
    
    const { getByTestId } = render(<RequestShift {...defaultProps} />);
    
    // Enter long reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, longReason);
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1', longReason);
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });
  });
});