import { renderHook, act } from '@testing-library/react-hooks';
import { expect } from 'vitest';
import useMutation from '../hooks/useMutation';

const mockInitialData = {
  id: '1',
};

const mockData = {
  name: 'test',
  email: 'test@example.com',
};

const mockUpdatedData = {
  ...mockInitialData,
  ...mockData,
};

const mockMutationFn = vi.fn(userData =>
  Promise.resolve({ ...mockInitialData, ...userData })
);

describe('useMutation hook', () => {
  beforeEach(() => {
    mockMutationFn.mockClear();
  });
  it('should handle a mutation', async () => {
    const { result, waitFor } = renderHook(() =>
      useMutation({ mutationFn: mockMutationFn })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();

    act(() => {
      void result.current.mutate(mockData);
    });

    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(mockMutationFn).toHaveBeenCalledTimes(1);
    expect(mockMutationFn).toHaveBeenCalledWith(mockData);
    expect(result.current.data).toEqual(mockUpdatedData);
    expect(result.current.error).toBeNull();
  });
  it('should handle mutation error', async () => {
    const error = new Error('Mutation failed');
    mockMutationFn.mockRejectedValueOnce(error);

    const { result, waitFor } = renderHook(() =>
      useMutation({ mutationFn: mockMutationFn })
    );

    act(() => {
      void result.current.mutate(mockData);
    });

    expect(result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(mockMutationFn).toHaveBeenCalledTimes(1);
    expect(mockMutationFn).toHaveBeenCalledWith(mockData);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });
  it('should call onMutate', async () => {
    const onMutate = vi.fn();

    const { result, waitFor } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onMutate,
      })
    );

    act(() => {
      void result.current.mutate(mockData);
    });

    await waitFor(() => {
      expect(onMutate).toHaveBeenCalledTimes(1);
      expect(onMutate).toHaveBeenCalledWith(mockData);
    });
  });
  it('should call onSuccess', async () => {
    const onSuccess = vi.fn();

    const { result, waitFor } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onSuccess,
      })
    );

    act(() => {
      void result.current.mutate(mockData);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(mockUpdatedData);
    });
  });
  it('should call onSettled', async () => {
    const onSettled = vi.fn();

    const { result, waitFor } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onSettled,
      })
    );

    act(() => {
      void result.current.mutate(mockData);
    });

    await waitFor(() => {
      expect(onSettled).toHaveBeenCalledTimes(1);
    });
  });
  it('should call onError', async () => {
    const error = new Error('Mutation failed');
    mockMutationFn.mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result, waitFor } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onError,
      })
    );

    act(() => {
      void result.current.mutate(mockData);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error);
      expect(result.current.error).toEqual(error);
    });
  });
});
