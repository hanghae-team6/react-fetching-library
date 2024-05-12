import { useState, useCallback } from 'react';

// MutationOptions 인터페이스 정의
type MutationOptions<T, R> = {
  mutationFn: (...args: T[]) => Promise<R>;
  onMutate?: (args: T[]) => void;
  onSuccess?: (data: R) => void;
  onError?: (error: Error) => void;
  onSettled?: (data?: R, error?: Error) => void;
};

export function useMutation<T, R>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: MutationOptions<T, R>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(
    async (...args: T[]) => {
      setIsLoading(true);
      setError(null);
      setData(null);
      onMutate?.(args);

      try {
        const result = await mutationFn(...args);
        setData(result);
        onSuccess?.(result);
        onSettled?.(result, undefined);
        return result;
      } catch (error: unknown) {
        const errorInstance =
          error instanceof Error
            ? error
            : new Error('An unexpected error occurred');
        setError(errorInstance);
        onError?.(errorInstance);
        onSettled?.(undefined, errorInstance);
        throw errorInstance;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled]
  );

  return { mutate, isLoading, data, error };
}
