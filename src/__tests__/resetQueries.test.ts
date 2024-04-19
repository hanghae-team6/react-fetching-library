import { QueryClient } from '@tanstack/react-query';
import { queryKey } from './utils';

describe('resetQueries test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.mount();
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
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
