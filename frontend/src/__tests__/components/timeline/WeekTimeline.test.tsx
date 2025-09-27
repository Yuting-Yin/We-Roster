import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WeekTimeline } from '@/components/timeline/WeekTimeline';

describe('WeekTimeline', () => {
  const defaultProps = {
    startDate: new Date('2024-01-15'),
    events: [
      {
        id: '1',
        title: 'Morning Shift',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
      },
      {
        id: '2',
        title: 'Evening Shift',
        start: '17:00',
        end: '01:00',
        type: 'shift',
        date: '2024-01-16',
      },
    ],
    onEventPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render week timeline with events', () => {
    const { getByTestId } = render(<WeekTimeline {...defaultProps} />);
    
    expect(getByTestId('week-timeline')).toBeTruthy();
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
  });

  it('should call onEventPress when event is pressed', () => {
    const { getByTestId } = render(<WeekTimeline {...defaultProps} />);
    
    const event = getByTestId('event-1');
    fireEvent.press(event);
    
    expect(defaultProps.onEventPress).toHaveBeenCalledWith(defaultProps.events[0]);
  });

  it('should render empty week timeline when no events', () => {
    const { getByTestId, queryByTestId } = render(
      <WeekTimeline {...defaultProps} events={[]} />
    );
    
    expect(getByTestId('week-timeline')).toBeTruthy();
    expect(queryByTestId('event-1')).toBeNull();
    expect(queryByTestId('event-2')).toBeNull();
  });

  it('should display day headers', () => {
    const { getByText } = render(<WeekTimeline {...defaultProps} />);
    
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
    expect(getByText('Sun')).toBeTruthy();
  });

  it('should display date numbers', () => {
    const { getByText } = render(<WeekTimeline {...defaultProps} />);
    
    expect(getByText('15')).toBeTruthy();
    expect(getByText('16')).toBeTruthy();
    expect(getByText('17')).toBeTruthy();
    expect(getByText('18')).toBeTruthy();
    expect(getByText('19')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('21')).toBeTruthy();
  });

  it('should handle events spanning multiple days', () => {
    const multiDayEvents = [
      {
        id: '1',
        title: 'Multi-day Event',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        endDate: '2024-01-17',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={multiDayEvents} />
    );
    
    expect(getByTestId('event-1')).toBeTruthy();
  });

  it('should handle events with different types', () => {
    const events = [
      {
        id: '1',
        title: 'Shift',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
      },
      {
        id: '2',
        title: 'Leave',
        start: '00:00',
        end: '23:59',
        type: 'leave',
        date: '2024-01-16',
      },
      {
        id: '3',
        title: 'Swap',
        start: '14:00',
        end: '22:00',
        type: 'swap',
        date: '2024-01-17',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
    expect(getByTestId('event-3')).toBeTruthy();
  });

  it('should handle overlapping events on same day', () => {
    const overlappingEvents = [
      {
        id: '1',
        title: 'Shift 1',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
      },
      {
        id: '2',
        title: 'Shift 2',
        start: '14:00',
        end: '22:00',
        type: 'shift',
        date: '2024-01-15',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={overlappingEvents} />
    );
    
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
  });

  it('should handle all-day events', () => {
    const allDayEvents = [
      {
        id: '1',
        title: 'All Day Leave',
        start: '00:00',
        end: '23:59',
        type: 'leave',
        date: '2024-01-15',
        allDay: true,
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={allDayEvents} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toBeTruthy();
  });

  it('should handle events with custom colors', () => {
    const events = [
      {
        id: '1',
        title: 'Custom Event',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        color: 'red',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should handle events with custom styles', () => {
    const events = [
      {
        id: '1',
        title: 'Styled Event',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        style: { borderWidth: 2, borderColor: 'blue' },
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toHaveStyle({ borderWidth: 2, borderColor: 'blue' });
  });

  it('should handle events with descriptions', () => {
    const events = [
      {
        id: '1',
        title: 'Event with Description',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        description: 'This is a test event',
      },
    ];

    const { getByText } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    expect(getByText('This is a test event')).toBeTruthy();
  });

  it('should handle events with locations', () => {
    const events = [
      {
        id: '1',
        title: 'Event with Location',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        location: 'Room 101',
      },
    ];

    const { getByText } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    expect(getByText('Room 101')).toBeTruthy();
  });

  it('should handle events with attendees', () => {
    const events = [
      {
        id: '1',
        title: 'Event with Attendees',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        attendees: ['John Doe', 'Jane Smith'],
      },
    ];

    const { getByText } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    expect(getByText('John Doe, Jane Smith')).toBeTruthy();
  });

  it('should handle events with status', () => {
    const events = [
      {
        id: '1',
        title: 'Event with Status',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        status: 'confirmed',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toBeTruthy();
  });

  it('should handle events with priority', () => {
    const events = [
      {
        id: '1',
        title: 'High Priority Event',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        date: '2024-01-15',
        priority: 'high',
      },
    ];

    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} events={events} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toBeTruthy();
  });

  it('should handle different start dates', () => {
    const { getByTestId, rerender } = render(<WeekTimeline {...defaultProps} />);
    
    // Change start date
    rerender(
      <WeekTimeline {...defaultProps} startDate={new Date('2024-01-22')} />
    );
    
    expect(getByTestId('week-timeline')).toBeTruthy();
  });

  it('should handle week boundary crossing', () => {
    const { getByTestId } = render(
      <WeekTimeline {...defaultProps} startDate={new Date('2024-01-31')} />
    );
    
    expect(getByTestId('week-timeline')).toBeTruthy();
  });
});
