import { renderHook, act } from '@testing-library/react-native';
import { useAutoCloseOverlays } from '@/hooks/useAutoCloseOverlays';

describe('useAutoCloseOverlays', () => {
  it('should close overlay after specified delay', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close overlay before delay expires', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 200));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for less than delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should cancel auto close when stopAutoClose is called', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Stop auto close immediately
    act(() => {
      result.current.stopAutoClose();
    });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should restart auto close when startAutoClose is called multiple times', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for half the delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Start auto close again (should restart timer)
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for half the delay again
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(onClose).not.toHaveBeenCalled();

    // Wait for the full delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle zero delay', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 0));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait a bit
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle negative delay', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, -100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait a bit
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined onClose callback', async () => {
    const { result } = renderHook(() => useAutoCloseOverlays(undefined, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should not throw error
    expect(result.current).toBeDefined();
  });

  it('should handle null onClose callback', async () => {
    const { result } = renderHook(() => useAutoCloseOverlays(null, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should not throw error
    expect(result.current).toBeDefined();
  });

  it('should cleanup on unmount', async () => {
    const onClose = jest.fn();
    const { result, unmount } = renderHook(() => useAutoCloseOverlays(onClose, 100));

    // Start auto close
    act(() => {
      result.current.startAutoClose();
    });

    // Unmount before delay expires
    unmount();

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should handle multiple start/stop cycles', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAutoCloseOverlays(onClose, 100));

    // Start and stop multiple times
    act(() => {
      result.current.startAutoClose();
    });

    act(() => {
      result.current.stopAutoClose();
    });

    act(() => {
      result.current.startAutoClose();
    });

    act(() => {
      result.current.stopAutoClose();
    });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
