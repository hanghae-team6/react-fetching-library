import { expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import useQuery from '../hooks/useQuery';

export interface ResponseType {
  id: string;
  content: string;
}

export const mockResponse: { [key: string]: ResponseType } = {
  test1: {
    id: '1',
    content: 'test1',
  },
  test2: {
    id: '2',
    content: 'test2',
  },
  test3: {
    id: '3',
    content: 'test3',
  },
};

const mockFetchFn = vi.fn((queryKey: string) =>
  Promise.resolve(mockResponse[queryKey])
);

describe('useQuery hook', () => {
  beforeEach(() => {
    mockFetchFn.mockClear();
  });

  it('should handle a query', async () => {
    const queryKey = 'test1';
    const { result, waitFor } = renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
        staleTime: 0,
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.data).toEqual(mockResponse[queryKey]);
  });

  it('should handle queries', async () => {
    const querykey1 = 'test2';
    const querykey2 = 'test3';

    const { result: result1, waitFor: waitFor1 } = renderHook(() =>
      useQuery({
        queryKey: [querykey1],
        queryFn: () => mockFetchFn(querykey1),
        staleTime: 0,
      })
    );
    const { result: result2, waitFor: waitFor2 } = renderHook(() =>
      useQuery({
        queryKey: [querykey2],
        queryFn: () => mockFetchFn(querykey2),
        staleTime: 0,
      })
    );

    expect(result1.current.data).toBeNull();
    expect(result1.current.isLoading).toBeTruthy();

    expect(result2.current.data).toBeNull();
    expect(result2.current.isLoading).toBeTruthy();

    await waitFor1(() => expect(result1.current.isLoading).toBeFalsy());
    await waitFor2(() => expect(result2.current.isLoading).toBeFalsy());

    expect(result1.current.data).toEqual(mockResponse[querykey1]);
    expect(result2.current.data).toEqual(mockResponse[querykey2]);
  });

  it('should cache result', async () => {
    const queryKey = 'test1';

    renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
      })
    );

    const { result: result2, waitFor } = renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
      })
    );

    expect(result2.current.data).toEqual(mockResponse[queryKey]);
    expect(result2.current.isLoading).toBeFalsy();

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalledTimes(0));
  });

  it('should invalidate cache', async () => {
    const queryKey = 'test1';
    const { result, waitFor } = renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
        staleTime: 0,
      })
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalledTimes(1));

    act(() => {
      void result.current.invalidateQueries([queryKey]);
    });

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalledTimes(2));
  });

  it('should handle success status', async () => {
    const queryKey = 'test1';
    const { result, waitFor } = renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
        staleTime: 0,
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('pending');
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.data).toEqual(mockResponse[queryKey]);
    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBeTruthy();
  });

  it('should handle error status', async () => {
    const error = new Error('Query Failed');
    mockFetchFn.mockRejectedValueOnce(error);

    const queryKey = 'test1';
    const { result, waitFor } = renderHook(() =>
      useQuery({
        queryKey: [queryKey],
        queryFn: () => mockFetchFn(queryKey),
        staleTime: 0,
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('pending');
    expect(result.current.isError).toBeFalsy();
    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBeTruthy();
    expect(result.current.error).toEqual(error);
  });
});
