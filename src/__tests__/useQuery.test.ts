// useQuery.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQuery } from '../core/useQuery';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('useQuery', () => {
  it('fetches and caches data correctly', async () => {
    const queryKey = ['test'];
    const queryFn = async () => {
      await sleep(100);
      return { message: 'Hello, World!' };
    };

    const { result } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
        staleTime: 1000,
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.status).toBe('pending');

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(result.current.data).toEqual({ message: 'Hello, World!' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.status).toBe('success');
  });

  it('uses cached data if available and not stale', async () => {
    const queryKey = ['cached'];
    const queryFn = async () => {
      await sleep(100);
      return { cached: true };
    };

    const { result: firstResult } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
        staleTime: 1000,
      })
    );

    await waitFor(() => expect(firstResult.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(firstResult.current.data).toEqual({ cached: true });

    const { result: secondResult } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
        staleTime: 1000,
      })
    );

    expect(secondResult.current.isLoading).toBe(false);
    expect(secondResult.current.isSuccess).toBe(true);
    expect(secondResult.current.data).toEqual({ cached: true });
  });

  it('refetches data if stale', async () => {
    const queryKey = ['stale'];
    const queryFn = async () => {
      await sleep(100);
      return { stale: true };
    };

    const { result: firstResult } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
        staleTime: 0, // Immediately stale
      })
    );

    await waitFor(() => expect(firstResult.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(firstResult.current.data).toEqual({ stale: true });

    const { result: secondResult } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
        staleTime: 0, // Immediately stale
      })
    );

    expect(secondResult.current.isLoading).toBe(true);
    expect(secondResult.current.isSuccess).toBe(false);

    await waitFor(() => expect(secondResult.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(secondResult.current.data).toEqual({ stale: true });
  });

  it('handles errors correctly', async () => {
    const queryKey = ['error'];
    const queryFn = async () => {
      await sleep(100);
      throw new Error('Test Error');
    };

    const { result } = renderHook(() =>
      useQuery({
        queryKey,
        queryFn,
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 2000,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.status).toBe('error');
  });
});
