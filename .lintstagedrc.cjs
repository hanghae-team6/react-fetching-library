module.exports = {
  '*.{js, jsx,ts,tsx}': ['eslint'],
  '*.test.{js, jsx,ts,tsx}': ['vitest run'],
  '*.*.{ts,tsx}': ['tsc --noEmit'],
};
