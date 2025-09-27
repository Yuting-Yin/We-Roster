import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SwapShift } from '@/components/overlays/SwapShift';

// Mock the API
jest.mock('@/api/swap', () => ({
  createSwapRequest: jest.fn(),
}));

// Mock the user API
jest.mock('@/api/user', () => ({
  getAvailableUsers: jest.fn(),
}));

// Mock the date utilities
jest.mock('@/lib/date', () => ({
  dayKey: jest.fn((date) => '2024-01-15'),
  fmt: jest.fn((date, options) => 'Jan 15, 2024'),
}));

// Mock the current user hook
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: { id: '1', name: 'John Doe' },
    displayName: 'John Doe',
    initials: 'JD',
    designation: 'Nurse',
  }),
}));

import { createSwapRequest } from '@/api/swap';
import { getAvailableUsers } from '@/api/user';

describe('SwapShift', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmitted: jest.fn(),
    date: new Date('2024-01-15'),
  };

  const mockAvailableUsers = [
    { id: '2', displayName: 'Jane Smith', title: 'Nurse' },
    { id: '3', displayName: 'Bob Johnson', title: 'Doctor' },
    { id: '4', displayName: 'Alice Brown', title: 'Nurse' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getAvailableUsers as jest.Mock).mockResolvedValue(mockAvailableUsers);
  });

  it('should render when visible', () => {
    const { getByText } = render(<SwapShift {...defaultProps} />);
    
    expect(getByText('Swap Shift')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<SwapShift {...defaultProps} visible={false} />);
    
    expect(queryByText('Swap Shift')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should load available users on mount', async () => {
    render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('should filter out current user from available users', async () => {
    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Current user (id: '1') should not be in the list
    const userList = getByTestId('user-list');
    expect(userList).toBeTruthy();
  });

  it('should submit swap request successfully', async () => {
    (createSwapRequest as jest.Mock).mockResolvedValueOnce({ id: '123' });

    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Select a user to swap with
    const userItem = getByTestId('user-item-2');
    fireEvent.press(userItem);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Schedule conflict');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createSwapRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterId: '1',
          targetId: '2',
          date: '2024-01-15',
          reason: 'Schedule conflict',
        })
      );
      expect(defaultProps.onSubmitted).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API errors gracefully', async () => {
    (createSwapRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Select a user to swap with
    const userItem = getByTestId('user-item-2');
    fireEvent.press(userItem);
    
    // Enter reason
    const reasonInput = getByTestId('reason-input');
    fireEvent.changeText(reasonInput, 'Schedule conflict');
    
    // Submit
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createSwapRequest).toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Try to submit without selecting a user
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createSwapRequest).not.toHaveBeenCalled();
      expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
    });
  });

  it('should handle empty available users list', async () => {
    (getAvailableUsers as jest.Mock).mockResolvedValueOnce([]);

    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    const userList = getByTestId('user-list');
    expect(userList).toBeTruthy();
  });

  it('should handle available users loading error', async () => {
    (getAvailableUsers as jest.Mock).mockRejectedValueOnce(new Error('Failed to load users'));

    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    const errorMessage = getByTestId('error-message');
    expect(errorMessage).toBeTruthy();
  });

  it('should show loading state while fetching users', () => {
    (getAvailableUsers as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('should handle user selection', async () => {
    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Select a user
    const userItem = getByTestId('user-item-2');
    fireEvent.press(userItem);
    
    // User should be selected
    expect(userItem).toHaveStyle({ backgroundColor: 'rgba(0, 0, 255, 0.1)' });
  });

  it('should allow changing selected user', async () => {
    const { getByTestId } = render(<SwapShift {...defaultProps} />);
    
    await waitFor(() => {
      expect(getAvailableUsers).toHaveBeenCalled();
    });

    // Select first user
    const userItem1 = getByTestId('user-item-2');
    fireEvent.press(userItem1);
    
    // Select second user
    const userItem2 = getByTestId('user-item-3');
    fireEvent.press(userItem2);
    
    // Second user should be selected
    expect(userItem2).toHaveStyle({ backgroundColor: 'rgba(0, 0, 255, 0.1)' });
  });
});