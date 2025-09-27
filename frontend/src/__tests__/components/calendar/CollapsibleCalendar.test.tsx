import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CollapsibleCalendar } from '@/components/calendar/CollapsibleCalendar';

describe('CollapsibleCalendar', () => {
  const defaultProps = {
    onDateSelect: jest.fn(),
    selectedDate: new Date('2024-01-15'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calendar', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    expect(getByTestId('collapsible-calendar')).toBeTruthy();
  });

  it('should call onDateSelect when date is selected', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    const dateButton = getByTestId('date-button-2024-01-16');
    fireEvent.press(dateButton);
    
    expect(defaultProps.onDateSelect).toHaveBeenCalledWith(new Date('2024-01-16'));
  });

  it('should highlight selected date', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    const selectedDateButton = getByTestId('date-button-2024-01-15');
    expect(selectedDateButton).toHaveStyle({ backgroundColor: 'rgba(0, 0, 255, 0.1)' });
  });

  it('should navigate to previous month', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    const prevButton = getByTestId('prev-month-button');
    fireEvent.press(prevButton);
    
    // Calendar should show previous month
    expect(getByTestId('month-year-text')).toHaveTextContent('December 2023');
  });

  it('should navigate to next month', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    const nextButton = getByTestId('next-month-button');
    fireEvent.press(nextButton);
    
    // Calendar should show next month
    expect(getByTestId('month-year-text')).toHaveTextContent('February 2024');
  });

  it('should toggle collapse state', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    const toggleButton = getByTestId('toggle-button');
    fireEvent.press(toggleButton);
    
    // Calendar should be collapsed
    expect(getByTestId('calendar-content')).toHaveStyle({ height: 0 });
  });

  it('should expand when collapsed and date is selected', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    // Collapse calendar
    const toggleButton = getByTestId('toggle-button');
    fireEvent.press(toggleButton);
    
    // Select a date
    const dateButton = getByTestId('date-button-2024-01-16');
    fireEvent.press(dateButton);
    
    // Calendar should expand
    expect(getByTestId('calendar-content')).toHaveStyle({ height: 'auto' });
  });

  it('should handle different initial dates', () => {
    const { getByTestId, rerender } = render(<CollapsibleCalendar {...defaultProps} />);
    
    // Change selected date
    rerender(<CollapsibleCalendar {...defaultProps} selectedDate={new Date('2024-02-20')} />);
    
    const selectedDateButton = getByTestId('date-button-2024-02-20');
    expect(selectedDateButton).toHaveStyle({ backgroundColor: 'rgba(0, 0, 255, 0.1)' });
  });

  it('should handle leap year dates', () => {
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} selectedDate={new Date('2024-02-29')} />
    );
    
    const leapDayButton = getByTestId('date-button-2024-02-29');
    expect(leapDayButton).toBeTruthy();
  });

  it('should handle year boundary navigation', () => {
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} selectedDate={new Date('2024-01-01')} />
    );
    
    // Navigate to previous month (should go to December 2023)
    const prevButton = getByTestId('prev-month-button');
    fireEvent.press(prevButton);
    
    expect(getByTestId('month-year-text')).toHaveTextContent('December 2023');
  });

  it('should handle year boundary navigation forward', () => {
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} selectedDate={new Date('2024-12-31')} />
    );
    
    // Navigate to next month (should go to January 2025)
    const nextButton = getByTestId('next-month-button');
    fireEvent.press(nextButton);
    
    expect(getByTestId('month-year-text')).toHaveTextContent('January 2025');
  });

  it('should show correct month and year', () => {
    const { getByTestId } = render(<CollapsibleCalendar {...defaultProps} />);
    
    expect(getByTestId('month-year-text')).toHaveTextContent('January 2024');
  });

  it('should handle disabled dates', () => {
    const disabledDates = [new Date('2024-01-16'), new Date('2024-01-17')];
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} disabledDates={disabledDates} />
    );
    
    const disabledDateButton = getByTestId('date-button-2024-01-16');
    expect(disabledDateButton).toHaveStyle({ opacity: 0.5 });
  });

  it('should not call onDateSelect for disabled dates', () => {
    const disabledDates = [new Date('2024-01-16')];
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} disabledDates={disabledDates} />
    );
    
    const disabledDateButton = getByTestId('date-button-2024-01-16');
    fireEvent.press(disabledDateButton);
    
    expect(defaultProps.onDateSelect).not.toHaveBeenCalled();
  });

  it('should handle custom date formatting', () => {
    const { getByTestId } = render(
      <CollapsibleCalendar 
        {...defaultProps} 
        dateFormat="MMM dd, yyyy"
      />
    );
    
    expect(getByTestId('month-year-text')).toHaveTextContent('Jan 15, 2024');
  });

  it('should handle custom theme colors', () => {
    const customTheme = {
      primaryColor: 'red',
      backgroundColor: 'white',
      textColor: 'black',
    };
    
    const { getByTestId } = render(
      <CollapsibleCalendar {...defaultProps} theme={customTheme} />
    );
    
    const calendar = getByTestId('collapsible-calendar');
    expect(calendar).toHaveStyle({ backgroundColor: 'white' });
  });
});
