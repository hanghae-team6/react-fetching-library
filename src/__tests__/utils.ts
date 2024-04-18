let queryKeyCount = 0;
export function queryKey(): Array<string> {
  queryKeyCount++;
  return [`query_${queryKeyCount}`];
}
