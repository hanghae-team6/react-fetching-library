import { QueryClient, QueryCache } from '@tanstack/react-query';
import { queryKey } from './utils';

describe('resetQueries test', () => {
  let queryClient: QueryClient;
  let queryCache: QueryCache;

  beforeEach(() => {
    queryClient = new QueryClient();
    queryCache = queryClient.getQueryCache();
    queryClient.mount();
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
  });

  test('should notify listeners when a query is reset', async () => {
    const key = queryKey();

    const callback = vi.fn();

    await queryClient.prefetchQuery({ queryKey: key, queryFn: () => 'data' });

    queryCache.subscribe(callback);

    await queryClient.resetQueries({ queryKey: key });

    expect(callback).toHaveBeenCalled();
  });

  test('should reset query', async () => {
    const key = queryKey();

    await queryClient.prefetchQuery({ queryKey: key, queryFn: () => 'data' });

    let state = queryClient.getQueryState(key);
    expect(state?.data).toEqual('data');
    expect(state?.status).toEqual('success');

    await queryClient.resetQueries({ queryKey: key });

    state = queryClient.getQueryState(key);

    expect(state).toBeTruthy();
    expect(state?.data).toBeUndefined();
    expect(state?.status).toEqual('pending');
    expect(state?.fetchStatus).toEqual('idle');
  });

  test('should reset query data to initial data if set', async () => {
    const key = queryKey();

    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: () => 'data',
      initialData: 'initial',
    });

    let state = queryClient.getQueryState(key);
    expect(state?.data).toEqual('data');

    await queryClient.resetQueries({ queryKey: key });

    state = queryClient.getQueryState(key);

    expect(state).toBeTruthy();
    expect(state?.data).toEqual('initial');
  });
});
