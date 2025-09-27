import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OpenShiftsFilter } from '@/components/overlays/OpenShiftsFilter';

describe('OpenShiftsFilter', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onApply: jest.fn(),
    filters: {
      dateRange: { start: null, end: null },
      shiftType: 'all',
      location: 'all',
      department: 'all',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(<OpenShiftsFilter {...defaultProps} />);
    
    expect(getByText('Filter Open Shifts')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(<OpenShiftsFilter {...defaultProps} visible={false} />);
    
    expect(queryByText('Filter Open Shifts')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onApply when apply button is pressed', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith(defaultProps.filters);
  });

  it('should handle date range selection', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const startDatePicker = getByTestId('start-date-picker');
    const endDatePicker = getByTestId('end-date-picker');
    
    expect(startDatePicker).toBeTruthy();
    expect(endDatePicker).toBeTruthy();
  });

  it('should handle shift type selection', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const shiftTypePicker = getByTestId('shift-type-picker');
    expect(shiftTypePicker).toBeTruthy();
    
    // Test different shift types
    fireEvent(shiftTypePicker, 'onValueChange', 'morning');
    fireEvent(shiftTypePicker, 'onValueChange', 'evening');
    fireEvent(shiftTypePicker, 'onValueChange', 'night');
    fireEvent(shiftTypePicker, 'onValueChange', 'all');
  });

  it('should handle location selection', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const locationPicker = getByTestId('location-picker');
    expect(locationPicker).toBeTruthy();
    
    // Test different locations
    fireEvent(locationPicker, 'onValueChange', 'room101');
    fireEvent(locationPicker, 'onValueChange', 'room102');
    fireEvent(locationPicker, 'onValueChange', 'all');
  });

  it('should handle department selection', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const departmentPicker = getByTestId('department-picker');
    expect(departmentPicker).toBeTruthy();
    
    // Test different departments
    fireEvent(departmentPicker, 'onValueChange', 'nursing');
    fireEvent(departmentPicker, 'onValueChange', 'emergency');
    fireEvent(departmentPicker, 'onValueChange', 'all');
  });

  it('should handle custom filter options', () => {
    const customFilters = {
      dateRange: { start: new Date('2024-01-15'), end: new Date('2024-01-20') },
      shiftType: 'morning',
      location: 'room101',
      department: 'nursing',
    };

    const { getByTestId } = render(
      <OpenShiftsFilter {...defaultProps} filters={customFilters} />
    );
    
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith(customFilters);
  });

  it('should handle reset filters', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const resetButton = getByTestId('reset-button');
    fireEvent.press(resetButton);
    
    // Filters should be reset to default values
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith({
      dateRange: { start: null, end: null },
      shiftType: 'all',
      location: 'all',
      department: 'all',
    });
  });

  it('should handle clear filters', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);
    
    // Filters should be cleared
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith({
      dateRange: { start: null, end: null },
      shiftType: 'all',
      location: 'all',
      department: 'all',
    });
  });

  it('should handle filter validation', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    // Test invalid date range (end before start)
    const startDatePicker = getByTestId('start-date-picker');
    const endDatePicker = getByTestId('end-date-picker');
    
    fireEvent(startDatePicker, 'onDateChange', new Date('2024-01-20'));
    fireEvent(endDatePicker, 'onDateChange', new Date('2024-01-15'));
    
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    // Should show validation error
    expect(getByTestId('validation-error')).toBeTruthy();
  });

  it('should handle filter presets', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const presetButton = getByTestId('preset-today');
    fireEvent.press(presetButton);
    
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    // Should apply today's date range
    expect(defaultProps.onApply).toHaveBeenCalled();
  });

  it('should handle custom filter presets', () => {
    const customPresets = [
      { name: 'This Week', dateRange: { start: new Date('2024-01-15'), end: new Date('2024-01-21') } },
      { name: 'This Month', dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') } },
    ];

    const { getByTestId } = render(
      <OpenShiftsFilter {...defaultProps} presets={customPresets} />
    );
    
    const presetButton = getByTestId('preset-this-week');
    fireEvent.press(presetButton);
    
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalled();
  });

  it('should handle filter changes', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    // Change shift type
    const shiftTypePicker = getByTestId('shift-type-picker');
    fireEvent(shiftTypePicker, 'onValueChange', 'evening');
    
    // Change location
    const locationPicker = getByTestId('location-picker');
    fireEvent(locationPicker, 'onValueChange', 'room102');
    
    // Change department
    const departmentPicker = getByTestId('department-picker');
    fireEvent(departmentPicker, 'onValueChange', 'emergency');
    
    // Apply changes
    const applyButton = getByTestId('apply-button');
    fireEvent.press(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith({
      dateRange: { start: null, end: null },
      shiftType: 'evening',
      location: 'room102',
      department: 'emergency',
    });
  });

  it('should handle filter cancellation', () => {
    const { getByTestId } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle filter animation', () => {
    const { getByTestId, rerender } = render(<OpenShiftsFilter {...defaultProps} />);
    
    const animations = ['slide', 'fade', 'scale'];
    
    animations.forEach(animation => {
      rerender(<OpenShiftsFilter {...defaultProps} animation={animation} />);
      
      const filter = getByTestId('open-shifts-filter');
      expect(filter).toBeTruthy();
    });
  });

  it('should handle custom filter styles', () => {
    const customStyle = { backgroundColor: 'white', borderRadius: 10 };
    
    const { getByTestId } = render(
      <OpenShiftsFilter {...defaultProps} style={customStyle} />
    );
    
    const filter = getByTestId('open-shifts-filter');
    expect(filter).toHaveStyle(customStyle);
  });

  it('should handle filter with custom title', () => {
    const { getByText } = render(
      <OpenShiftsFilter {...defaultProps} title="Custom Open Shifts Filter" />
    );
    
    expect(getByText('Custom Open Shifts Filter')).toBeTruthy();
  });

  it('should handle filter with custom buttons', () => {
    const customButtons = {
      apply: { text: 'Apply Filters', style: { backgroundColor: 'blue' } },
      reset: { text: 'Reset All', style: { backgroundColor: 'gray' } },
      clear: { text: 'Clear All', style: { backgroundColor: 'red' } },
    };

    const { getByText } = render(
      <OpenShiftsFilter {...defaultProps} buttons={customButtons} />
    );
    
    expect(getByText('Apply Filters')).toBeTruthy();
    expect(getByText('Reset All')).toBeTruthy();
    expect(getByText('Clear All')).toBeTruthy();
  });

  it('should handle filter with custom options', () => {
    const customOptions = {
      shiftTypes: ['morning', 'evening', 'night', 'weekend'],
      locations: ['room101', 'room102', 'room103'],
      departments: ['nursing', 'emergency', 'surgery'],
    };

    const { getByTestId } = render(
      <OpenShiftsFilter {...defaultProps} options={customOptions} />
    );
    
    const shiftTypePicker = getByTestId('shift-type-picker');
    const locationPicker = getByTestId('location-picker');
    const departmentPicker = getByTestId('department-picker');
    
    expect(shiftTypePicker).toBeTruthy();
    expect(locationPicker).toBeTruthy();
    expect(departmentPicker).toBeTruthy();
  });
});