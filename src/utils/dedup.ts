export function dedup(arr: any[]) {
  return Object.keys(arr.reduce((memo, value) => {
    memo[value] = true;
    return memo;
  }, {}));
}

export default dedup;
