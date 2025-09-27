import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OpenShiftDetails } from '@/components/overlays/OpenShiftDetails';

// Mock the API
jest.mock('@/api/myroster', () => ({
  requestShift: jest.fn(),
}));

import { requestShift } from '@/api/myroster';

describe('OpenShiftDetails', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onRequested: jest.fn(),
    shift: {
      id: '1',
      title: 'Open Morning Shift',
      start: '09:00',
      end: '17:00',
      type: 'shift',
      location: 'Room 101',
      description: 'Available morning shift',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<OpenShiftDetails {...defaultProps} />);
    
    expect(getByText('Open Shift Details')).toBeTruthy();
    expect(getByText('Open Morning Shift')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<OpenShiftDetails {...defaultProps} visible={false} />);
    
    expect(queryByText('Open Shift Details')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<OpenShiftDetails {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display shift information', () => {
    const { getByText } = render(<OpenShiftDetails {...defaultProps} />);
    
    expect(getByText('Open Morning Shift')).toBeTruthy();
    expect(getByText('09:00 - 17:00')).toBeTruthy();
    expect(getByText('Room 101')).toBeTruthy();
    expect(getByText('Available morning shift')).toBeTruthy();
  });

  it('should request shift successfully', async () => {
    (requestShift as jest.Mock).mockResolvedValueOnce({ success: true });

    const { getByTestId } = render(<OpenShiftDetails {...defaultProps} />);
    
    const requestButton = getByTestId('request-button');
    fireEvent.press(requestButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1');
      expect(defaultProps.onRequested).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle request shift failure', async () => {
    (requestShift as jest.Mock).mockRejectedValueOnce(new Error('Request failed'));

    const { getByTestId } = render(<OpenShiftDetails {...defaultProps} />);
    
    const requestButton = getByTestId('request-button');
    fireEvent.press(requestButton);

    await waitFor(() => {
      expect(requestShift).toHaveBeenCalledWith('1');
      expect(defaultProps.onRequested).not.toHaveBeenCalled();
    });
  });

  it('should show loading state during request', async () => {
    (requestShift as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const { getByTestId } = render(<OpenShiftDetails {...defaultProps} />);
    
    const requestButton = getByTestId('request-button');
    fireEvent.press(requestButton);

    // Check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle shift without location', () => {
    const shiftWithoutLocation = {
      ...defaultProps.shift,
      location: undefined,
    };

    const { queryByText } = render(
      <OpenShiftDetails {...defaultProps} shift={shiftWithoutLocation} />
    );
    
    expect(queryByText('Room 101')).toBeNull();
  });

  it('should handle shift without description', () => {
    const shiftWithoutDescription = {
      ...defaultProps.shift,
      description: undefined,
    };

    const { queryByText } = render(
      <OpenShiftDetails {...defaultProps} shift={shiftWithoutDescription} />
    );
    
    expect(queryByText('Available morning shift')).toBeNull();
  });

  it('should handle different shift types', () => {
    const { getByTestId, rerender } = render(<OpenShiftDetails {...defaultProps} />);
    
    // Test different shift types
    const shiftTypes = ['shift', 'leave', 'swap'];
    
    shiftTypes.forEach(type => {
      const shiftWithType = {
        ...defaultProps.shift,
        type,
      };
      
      rerender(<OpenShiftDetails {...defaultProps} shift={shiftWithType} />);
      
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithColor} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithStyle} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithRequirements} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithEquipment} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithContact} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithNotes} />
    );
    
    expect(getByText('Important notes about this shift')).toBeTruthy();
  });

  it('should handle shift with priority', () => {
    const shiftWithPriority = {
      ...defaultProps.shift,
      priority: 'high',
    };

    const { getByText } = render(
      <OpenShiftDetails {...defaultProps} shift={shiftWithPriority} />
    );
    
    expect(getByText('High Priority')).toBeTruthy();
  });

  it('should handle shift with status', () => {
    const shiftWithStatus = {
      ...defaultProps.shift,
      status: 'available',
    };

    const { getByText } = render(
      <OpenShiftDetails {...defaultProps} shift={shiftWithStatus} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithWeather} />
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
      <OpenShiftDetails {...defaultProps} shift={shiftWithTraffic} />
    );
    
    expect(getByText('Heavy')).toBeTruthy();
    expect(getByText('45 minutes')).toBeTruthy();
  });

  it('should disable request button when already requested', () => {
    const shiftAlreadyRequested = {
      ...defaultProps.shift,
      status: 'requested',
    };

    const { getByTestId } = render(
      <OpenShiftDetails {...defaultProps} shift={shiftAlreadyRequested} />
    );
    
    const requestButton = getByTestId('request-button');
    expect(requestButton).toBeDisabled();
  });

  it('should show different button text for different statuses', () => {
    const { getByText, rerender } = render(<OpenShiftDetails {...defaultProps} />);
    
    expect(getByText('Request Shift')).toBeTruthy();
    
    // Test different statuses
    const statuses = [
      { status: 'requested', text: 'Requested' },
      { status: 'filled', text: 'Filled' },
      { status: 'cancelled', text: 'Cancelled' },
    ];
    
    statuses.forEach(({ status, text }) => {
      const shiftWithStatus = {
        ...defaultProps.shift,
        status,
      };
      
      rerender(<OpenShiftDetails {...defaultProps} shift={shiftWithStatus} />);
      
      expect(getByText(text)).toBeTruthy();
    });
  });
});