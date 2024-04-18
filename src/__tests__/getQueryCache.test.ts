import { describe, it, expect } from 'vitest';
import { QueryClient, QueryCache } from '@tanstack/react-query';

// const TEST_QUERY_KEY: string[] = ['user', 'user1'];

describe('getQueryCache 메소드 테스트 코드', () => {
  it('getQueryCache는 객체를 반환합니다', () => {
    // QueryClient로 인스턴스를 생성하고, getQueryCache 메소드를 이용해 반환값을 받는다
    const queryClient: QueryClient = new QueryClient();
    const cache: QueryCache = queryClient.getQueryCache();

    // 반환값은 일단 객체여야 한다
    expect(cache).toBeDefined(); // TODO: toBeDefined() 알아보기
    expect(typeof cache).toBe('object');

    // TODO: 내부 로직까지는 아니어도 기능을 파악해서 코드를 추가한다
    // getQueryCache 메서드는 이 클라이언트가 연결된 쿼리 캐시를 반환합니다 => TODO: 쿼리캐시란 무엇인가?
  });
});
