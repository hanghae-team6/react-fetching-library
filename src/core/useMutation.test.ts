import { renderHook, act } from '@testing-library/react-hooks';
import { useMutation } from '../core/useMutation';
import { vi } from 'vitest';

interface UserData {
  id: number;
  name: string;
}

// Define the mock function with explicit return type
const mockMutationFn = vi.fn((userId: number) =>
  Promise.resolve<UserData>({ id: userId, name: 'John Doe' })
);
const onSuccess = vi.fn();
const onError = vi.fn();
const onMutate = vi.fn();
const onSettled = vi.fn();

describe('useMutation hook', () => {
  it('executes the mutation function and handles success', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMutation<number, UserData>({
        mutationFn: mockMutationFn,
        onMutate,
        onSuccess,
        onError,
        onSettled,
      })
    );

    act(() => {
      void result.current.mutate(1);
    });

    await waitForNextUpdate();

    expect(mockMutationFn).toHaveBeenCalledWith(1);
    expect(onMutate).toHaveBeenCalledWith([1]);
    expect(result.current.data).toEqual({ id: 1, name: 'John Doe' });
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith({ id: 1, name: 'John Doe' });
    expect(onSettled).toHaveBeenCalledWith(
      { id: 1, name: 'John Doe' },
      undefined
    );
  });

  // it('handles errors correctly', async () => {
  //   const mockError = new Error('An unexpected error occurred');
  //   mockMutationFn.mockImplementationOnce(() => Promise.reject(mockError));

  //   const { result, waitFor } = renderHook(() =>
  //     useMutation<number, UserData>({
  //       mutationFn: mockMutationFn,
  //       onMutate,
  //       onSuccess,
  //       onError,
  //       onSettled,
  //     })
  //   );

  //   await act(async () => {
  //     await result.current.mutate(1);
  //   });

  //   // 에러 상태가 설정될 때까지 기다립니다.
  //   await waitFor(() => expect(result.current.error).toEqual(mockError));

  //   expect(mockMutationFn).toHaveBeenCalledWith(1);
  //   expect(result.current.isLoading).toBeFalsy();
  //   expect(result.current.data).toBeNull();
  //   expect(onError).toHaveBeenCalledWith(mockError);
  //   expect(onSettled).toHaveBeenCalledWith(undefined, mockError);
  // });
});
