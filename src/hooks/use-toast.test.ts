import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from './use-toast';

describe('useToast', () => {
  // We use real timers in afterEach to ensure cleanup happens
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should remove a toast from state after a reasonable delay when dismissed', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useToast());

    // Pre-condition: ensure the toast list is empty to have a clean test run.
    // This is a workaround for the module-level state in use-toast.ts
    // that persists between tests.
    act(() => {
      result.current.toasts.forEach(t => result.current.dismiss(t.id));
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.toasts).toHaveLength(0);

    // 1. Add a toast
    act(() => {
      toast({ title: 'My Toast' });
    });
    expect(result.current.toasts).toHaveLength(1);
    const toastId = result.current.toasts[0].id;

    // 2. Dismiss the toast
    act(() => {
      result.current.dismiss(toastId);
    });
    expect(result.current.toasts[0].open).toBe(false);

    // 3. Advance timer by a reasonable amount
    act(() => {
      jest.advanceTimersByTime(1500); // 1.5 seconds
    });

    // 4. Expect toast to be removed.
    // This will fail because TOAST_REMOVE_DELAY is 1,000,000ms
    expect(result.current.toasts).toHaveLength(0);
  });
});
