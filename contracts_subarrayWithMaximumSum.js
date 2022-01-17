/** @param {NS} ns **/
export async function main(ns) {
  const data = [2, 2, -5, -6, -9, 7, -2, -2, -6];
  let max = subarrayWithMaximumSum(ns, data);
  ns.tprintf("max sum is %d", max);
}

/** @param {NS} ns **/
export function subarrayWithMaximumSum(ns, data) {
  ns.tprintf("data: %v", data);
  let maxSum = 0;

  for (let start = 0; start < data.length; start++) {
    for (let finish = start; finish < data.length; finish++) {
      let sum = 0;
      for (let i = start; i <= finish; i++) {
        sum += data[i];
      }
      maxSum = Math.max(maxSum, sum);
      if (maxSum == sum) {
        ns.tprintf("sum of elements from %d (a %d) to %d (a %d) is %d", start, data[start], finish, data[finish], sum);
      }
    }
  }
  ns.tprintf("max sum is %d!", maxSum);
  return maxSum;
}
