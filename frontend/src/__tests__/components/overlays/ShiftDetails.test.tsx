import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ShiftDetails } from '@/components/overlays/ShiftDetails';

describe('ShiftDetails', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
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
    const { getByText } = render(<ShiftDetails {...defaultProps} />);
    
    expect(getByText('Shift Details')).toBeTruthy();
    expect(getByText('Morning Shift')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<ShiftDetails {...defaultProps} visible={false} />);
    
    expect(queryByText('Shift Details')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<ShiftDetails {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display shift information', () => {
    const { getByText } = render(<ShiftDetails {...defaultProps} />);
    
    expect(getByText('Morning Shift')).toBeTruthy();
    expect(getByText('09:00 - 17:00')).toBeTruthy();
    expect(getByText('Room 101')).toBeTruthy();
    expect(getByText('Regular morning shift')).toBeTruthy();
  });

  it('should handle shift without location', () => {
    const shiftWithoutLocation = {
      ...defaultProps.shift,
      location: undefined,
    };

    const { queryByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithoutLocation} />
    );
    
    expect(queryByText('Room 101')).toBeNull();
  });

  it('should handle shift without description', () => {
    const shiftWithoutDescription = {
      ...defaultProps.shift,
      description: undefined,
    };

    const { queryByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithoutDescription} />
    );
    
    expect(queryByText('Regular morning shift')).toBeNull();
  });

  it('should handle different shift types', () => {
    const { getByTestId, rerender } = render(<ShiftDetails {...defaultProps} />);
    
    // Test different shift types
    const shiftTypes = ['shift', 'leave', 'swap'];
    
    shiftTypes.forEach(type => {
      const shiftWithType = {
        ...defaultProps.shift,
        type,
      };
      
      rerender(<ShiftDetails {...defaultProps} shift={shiftWithType} />);
      
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
      <ShiftDetails {...defaultProps} shift={shiftWithColor} />
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
      <ShiftDetails {...defaultProps} shift={shiftWithStyle} />
    );
    
    const shiftDetails = getByTestId('shift-details');
    expect(shiftDetails).toHaveStyle({ borderWidth: 2, borderColor: 'blue' });
  });

  it('should handle shift with attendees', () => {
    const shiftWithAttendees = {
      ...defaultProps.shift,
      attendees: ['John Doe', 'Jane Smith'],
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithAttendees} />
    );
    
    expect(getByText('John Doe, Jane Smith')).toBeTruthy();
  });

  it('should handle shift with status', () => {
    const shiftWithStatus = {
      ...defaultProps.shift,
      status: 'confirmed',
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithStatus} />
    );
    
    expect(getByText('Confirmed')).toBeTruthy();
  });

  it('should handle shift with priority', () => {
    const shiftWithPriority = {
      ...defaultProps.shift,
      priority: 'high',
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithPriority} />
    );
    
    expect(getByText('High Priority')).toBeTruthy();
  });

  it('should handle shift with notes', () => {
    const shiftWithNotes = {
      ...defaultProps.shift,
      notes: 'Important notes about this shift',
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithNotes} />
    );
    
    expect(getByText('Important notes about this shift')).toBeTruthy();
  });

  it('should handle shift with requirements', () => {
    const shiftWithRequirements = {
      ...defaultProps.shift,
      requirements: ['Nursing license', 'CPR certification'],
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithRequirements} />
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
      <ShiftDetails {...defaultProps} shift={shiftWithEquipment} />
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
      <ShiftDetails {...defaultProps} shift={shiftWithContact} />
    );
    
    expect(getByText('Dr. Smith')).toBeTruthy();
    expect(getByText('555-1234')).toBeTruthy();
    expect(getByText('dr.smith@hospital.com')).toBeTruthy();
  });

  it('should handle shift with emergency contact', () => {
    const shiftWithEmergencyContact = {
      ...defaultProps.shift,
      emergencyContact: {
        name: 'Emergency Line',
        phone: '911',
      },
    };

    const { getByText } = render(
      <ShiftDetails {...defaultProps} shift={shiftWithEmergencyContact} />
    );
    
    expect(getByText('Emergency Line')).toBeTruthy();
    expect(getByText('911')).toBeTruthy();
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
      <ShiftDetails {...defaultProps} shift={shiftWithWeather} />
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
      <ShiftDetails {...defaultProps} shift={shiftWithTraffic} />
    );
    
    expect(getByText('Heavy')).toBeTruthy();
    expect(getByText('45 minutes')).toBeTruthy();
  });
});