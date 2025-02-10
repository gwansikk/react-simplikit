import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useImpressionRef, UseImpressionRefOptions } from './useImpressionRef.ts';

const mockInstances: any[] = [];

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    mockInstances.push(this);
  }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('useImpressionRef', () => {
  const mockOnImpressionStart = vi.fn();
  const mockOnImpressionEnd = vi.fn();

  const defaultOptions: UseImpressionRefOptions = {
    onImpressionStart: mockOnImpressionStart,
    onImpressionEnd: mockOnImpressionEnd,
    timeThreshold: 100,
    rootMargin: '0px',
    areaThreshold: 0.5,
  };

  const originalVisibilityState = document.visibilityState;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', { value: originalVisibilityState, writable: true });
  });

  const setup = (options = defaultOptions) => {
    const { result } = renderHook(() => useImpressionRef(options));
    const mockElement = document.createElement('div');
    act(() => result.current(mockElement));
    return { result, observerCallback: mockInstances[0].callback };
  };

  it('should call onImpressionStart when element becomes visible', () => {
    const { observerCallback } = setup();
    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 0.6 }], null);
      vi.runAllTimers();
    });

    expect(mockOnImpressionStart).toHaveBeenCalledTimes(1);
    expect(mockOnImpressionEnd).not.toHaveBeenCalled();
  });

  it('should call onImpressionEnd when element goes out of view', () => {
    const { observerCallback } = setup();
    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 0.6 }], null);
      vi.runAllTimers();
      observerCallback([{ isIntersecting: false, intersectionRatio: 0 }], null);
      vi.runAllTimers();
    });

    expect(mockOnImpressionStart).toHaveBeenCalledTimes(1);
    expect(mockOnImpressionEnd).toHaveBeenCalledTimes(1);
  });

  it('should handle default options without errors', () => {
    const { observerCallback } = setup({});
    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 0.6 }], null);
      vi.runAllTimers();
    });

    expect(mockOnImpressionStart).not.toHaveBeenCalled();
    expect(mockOnImpressionEnd).not.toHaveBeenCalled();
  });

  it('should not call handlers when document is hidden', () => {
    const { observerCallback } = setup();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });

    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 0.6 }], null);
      vi.runAllTimers();
    });

    expect(mockOnImpressionStart).not.toHaveBeenCalled();
    expect(mockOnImpressionEnd).not.toHaveBeenCalled();
  });

  it('should handle visibility change to hidden', () => {
    const { observerCallback } = setup();

    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 0.6 }], null);
      vi.runAllTimers();
    });

    expect(mockOnImpressionStart).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      vi.runAllTimers();
    });

    expect(mockOnImpressionEnd).toHaveBeenCalledTimes(1);
  });

  it('should not call handlers if element is not intersecting on visibility change', () => {
    const { observerCallback } = setup();
    act(() => {
      observerCallback([{ isIntersecting: false, intersectionRatio: 0 }], null);
      vi.runAllTimers();
    });

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(mockOnImpressionStart).not.toHaveBeenCalled();
    expect(mockOnImpressionEnd).not.toHaveBeenCalled();
  });
});
