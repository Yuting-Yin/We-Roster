import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DayTimeline } from '@/components/timeline/DayTimeline';

describe('DayTimeline', () => {
  const defaultProps = {
    date: new Date('2024-01-15'),
    events: [
      {
        id: '1',
        title: 'Morning Shift',
        start: '09:00',
        end: '17:00',
        type: 'shift',
      },
      {
        id: '2',
        title: 'Personal Leave',
        start: '00:00',
        end: '23:59',
        type: 'leave',
      },
    ],
    onEventPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render timeline with events', () => {
    const { getByTestId } = render(<DayTimeline {...defaultProps} />);
    
    expect(getByTestId('day-timeline')).toBeTruthy();
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
  });

  it('should call onEventPress when event is pressed', () => {
    const { getByTestId } = render(<DayTimeline {...defaultProps} />);
    
    const event = getByTestId('event-1');
    fireEvent.press(event);
    
    expect(defaultProps.onEventPress).toHaveBeenCalledWith(defaultProps.events[0]);
  });

  it('should render empty timeline when no events', () => {
    const { getByTestId, queryByTestId } = render(
      <DayTimeline {...defaultProps} events={[]} />
    );
    
    expect(getByTestId('day-timeline')).toBeTruthy();
    expect(queryByTestId('event-1')).toBeNull();
    expect(queryByTestId('event-2')).toBeNull();
  });

  it('should display event titles', () => {
    const { getByText } = render(<DayTimeline {...defaultProps} />);
    
    expect(getByText('Morning Shift')).toBeTruthy();
    expect(getByText('Personal Leave')).toBeTruthy();
  });

  it('should display event times', () => {
    const { getByText } = render(<DayTimeline {...defaultProps} />);
    
    expect(getByText('09:00 - 17:00')).toBeTruthy();
    expect(getByText('00:00 - 23:59')).toBeTruthy();
  });

  it('should handle different event types', () => {
    const events = [
      {
        id: '1',
        title: 'Shift',
        start: '09:00',
        end: '17:00',
        type: 'shift',
      },
      {
        id: '2',
        title: 'Leave',
        start: '00:00',
        end: '23:59',
        type: 'leave',
      },
      {
        id: '3',
        title: 'Swap',
        start: '14:00',
        end: '22:00',
        type: 'swap',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
    );
    
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
    expect(getByTestId('event-3')).toBeTruthy();
  });

  it('should handle overlapping events', () => {
    const overlappingEvents = [
      {
        id: '1',
        title: 'Shift 1',
        start: '09:00',
        end: '17:00',
        type: 'shift',
      },
      {
        id: '2',
        title: 'Shift 2',
        start: '14:00',
        end: '22:00',
        type: 'shift',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={overlappingEvents} />
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
        allDay: true,
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={allDayEvents} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toBeTruthy();
  });

  it('should handle events with different durations', () => {
    const events = [
      {
        id: '1',
        title: 'Short Event',
        start: '10:00',
        end: '10:30',
        type: 'shift',
      },
      {
        id: '2',
        title: 'Long Event',
        start: '08:00',
        end: '20:00',
        type: 'shift',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
    );
    
    expect(getByTestId('event-1')).toBeTruthy();
    expect(getByTestId('event-2')).toBeTruthy();
  });

  it('should handle events with custom colors', () => {
    const events = [
      {
        id: '1',
        title: 'Custom Event',
        start: '09:00',
        end: '17:00',
        type: 'shift',
        color: 'red',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        style: { borderWidth: 2, borderColor: 'blue' },
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        description: 'This is a test event',
      },
    ];

    const { getByText } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        location: 'Room 101',
      },
    ];

    const { getByText } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        attendees: ['John Doe', 'Jane Smith'],
      },
    ];

    const { getByText } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        status: 'confirmed',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
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
        priority: 'high',
      },
    ];

    const { getByTestId } = render(
      <DayTimeline {...defaultProps} events={events} />
    );
    
    const event = getByTestId('event-1');
    expect(event).toBeTruthy();
  });
});
