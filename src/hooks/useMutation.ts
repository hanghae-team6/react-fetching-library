import { useState, useCallback } from 'react';

interface UseMutationProps<TParams, TReturn> {
  mutationFn: (params: TParams) => Promise<TReturn>;
  onSuccess?: (response: unknown) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
}

const useMutation = <TParams, TReturn>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
}: UseMutationProps<TParams, TReturn>) => {
  const [data, setData] = useState<TReturn | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (params: TParams) => {
      setIsLoading(true);
      setData(null);
      setError(null);

      try {
        const res = await mutationFn(params);
        setData(res);
        setError(null);
        onSuccess && onSuccess(res);
      } catch (err) {
        setError(err as Error);
        setData(null);
        onError && onError(err as Error);
      } finally {
        setIsLoading(false);
        onSettled && onSettled();
      }
    },
    [mutationFn, onError, onSettled, onSuccess]
  );

  return { mutate, data, isLoading, error };
};
export default useMutation;
