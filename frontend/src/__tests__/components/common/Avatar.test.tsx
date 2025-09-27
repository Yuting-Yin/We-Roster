import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/common/Avatar';

describe('Avatar', () => {
  it('should render with initials', () => {
    const { getByText } = render(<Avatar initials="JD" />);
    
    expect(getByText('JD')).toBeTruthy();
  });

  it('should render with image source', () => {
    const { getByTestId } = render(<Avatar source={{ uri: 'https://example.com/avatar.jpg' }} />);
    
    const image = getByTestId('avatar-image');
    expect(image).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByTestId, rerender } = render(<Avatar initials="JD" size="small" />);
    
    let avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
    
    rerender(<Avatar initials="JD" size="medium" />);
    avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
    
    rerender(<Avatar initials="JD" size="large" />);
    avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('should render with different colors', () => {
    const { getByTestId, rerender } = render(<Avatar initials="JD" color="blue" />);
    
    let avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
    
    rerender(<Avatar initials="JD" color="green" />);
    avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
    
    rerender(<Avatar initials="JD" color="red" />);
    avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { borderWidth: 2, borderColor: 'black' };
    const { getByTestId } = render(<Avatar initials="JD" style={customStyle} />);
    
    const avatar = getByTestId('avatar');
    expect(avatar).toHaveStyle(customStyle);
  });

  it('should render with onPress handler', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Avatar initials="JD" onPress={onPress} />);
    
    const avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('should render without onPress handler', () => {
    const { getByTestId } = render(<Avatar initials="JD" />);
    
    const avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('should render with long initials', () => {
    const { getByText } = render(<Avatar initials="ABCDEFGHIJKLMNOPQRSTUVWXYZ" />);
    
    expect(getByText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeTruthy();
  });

  it('should render with single character initials', () => {
    const { getByText } = render(<Avatar initials="A" />);
    
    expect(getByText('A')).toBeTruthy();
  });

  it('should render with empty initials', () => {
    const { getByText } = render(<Avatar initials="" />);
    
    expect(getByText('')).toBeTruthy();
  });

  it('should render with undefined initials', () => {
    const { getByText } = render(<Avatar initials={undefined} />);
    
    expect(getByText('')).toBeTruthy();
  });

  it('should render with null initials', () => {
    const { getByText } = render(<Avatar initials={null} />);
    
    expect(getByText('')).toBeTruthy();
  });
});
