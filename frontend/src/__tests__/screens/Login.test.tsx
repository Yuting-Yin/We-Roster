import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/screens/Login';

// Mock navigation
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
  }),
}));

// Mock auth context
const mockLogin = jest.fn();
const mockIsAuthenticated = false;

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

describe('Login Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    const { getByTestId } = render(<Login />);
    
    expect(getByTestId('domain-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('should handle successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<Login />);
    
    // Fill in form
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'test@example.com', 'password');
    });
  });

  it('should handle login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByTestId } = render(<Login />);
    
    // Fill in form
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'test@example.com', 'wrongpassword');
    });
  });

  it('should validate required fields', async () => {
    const { getByTestId } = render(<Login />);
    
    // Try to submit without filling fields
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    const { getByTestId } = render(<Login />);
    
    // Fill in form with invalid email
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const { getByTestId } = render(<Login />);
    
    // Fill in form
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    // Check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle network errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = render(<Login />);
    
    // Fill in form
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'test@example.com', 'password');
    });
  });

  it('should clear form after successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<Login />);
    
    // Fill in form
    const domainInput = getByTestId('domain-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(domainInput, 'test');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password');
    
    // Submit form
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'test@example.com', 'password');
    });

    // Form should be cleared
    expect(domainInput.props.value).toBe('');
    expect(emailInput.props.value).toBe('');
    expect(passwordInput.props.value).toBe('');
  });
});
