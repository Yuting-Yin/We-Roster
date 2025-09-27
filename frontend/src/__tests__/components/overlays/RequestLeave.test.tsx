import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RequestLeave } from '@/components/overlays/RequestLeave';

// Mock the API
jest.mock('@/api/leave', () => ({
  createLeaveRequest: jest.fn(),
}));

// Mock the date utilities
jest.mock('@/lib/date', () => ({
  dayKey: jest.fn((date) => '2024-01-15'),
  fmt: jest.fn((date, options) => 'Jan 15, 2024'),
}));

import { createLeaveRequest } from '@/api/leave';

describe('RequestLeave', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmitted: jest.fn(),
    date: new Date('2024-01-15'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<RequestLeave {...defaultProps} />);
    
    expect(getByText('Request Leave')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<RequestLeave {...defaultProps} visible={false} />);
    
    expect(queryByText('Request Leave')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should submit all-day leave request successfully', async () => {
    (createLeaveRequest as jest.Mock).mockResolvedValueOnce({ id: '123' });

    const { getByTestId, getByText } = render(<RequestLeave {...defaultProps} />);
    
    // Select all-day option
    const allDayOption = getByTestId('all-day-option');
    fireEvent.press(allDayOption);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Personal leave');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          allDay: true,
          date: '2024-01-15',
          reason: 'Personal leave',
        })
      );
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });
  });

  it('should submit shift leave request successfully', async () => {
    (createLeaveRequest as jest.Mock).mockResolvedValueOnce({ id: '124' });

    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    // Select shift option
    const shiftOption = getByTestId('shift-option');
    fireEvent.press(shiftOption);
    
    // Enter start time
    const startTimeInput = getByTestId('start-time-input');
    fireEvent.changeText(startTimeInput, '09:00');
    
    // Enter end time
    const endTimeInput = getByTestId('end-time-input');
    fireEvent.changeText(endTimeInput, '17:00');
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Medical appointment');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          allDay: false,
          date: '2024-01-15',
          start: '09:00',
          end: '17:00',
          reason: 'Medical appointment',
        })
      );
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API errors gracefully', async () => {
    (createLeaveRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    // Select all-day option
    const allDayOption = getByTestId('all-day-option');
    fireEvent.press(allDayOption);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Personal leave');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should handle duplicate leave request error', async () => {
    (createLeaveRequest as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'A leave request for this day already exists',
      duplicate: true,
    });

    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    // Select all-day option
    const allDayOption = getByTestId('all-day-option');
    fireEvent.press(allDayOption);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Personal leave');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    // Try to submit without selecting leave type
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).not.toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should validate shift times when shift option is selected', async () => {
    const { getByTestId } = render(<RequestLeave {...defaultProps} />);
    
    // Select shift option
    const shiftOption = getByTestId('shift-option');
    fireEvent.press(shiftOption);
    
    // Enter only start time
    const startTimeInput = getByTestId('start-time-input');
    fireEvent.changeText(startTimeInput, '09:00');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createLeaveRequest).not.toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });
});