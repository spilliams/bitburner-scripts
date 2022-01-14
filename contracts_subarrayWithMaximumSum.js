/** @param {NS} ns **/
export async function main(ns) {
  let max = subarrayWithMaximumSum(ns, ns.args);
  ns.tprintf("max sum is %d", max);
}

/** @param {NS} ns **/
export function subarrayWithMaximumSum(ns, data) {
  let maxSum = 0;
  for (let start = 0; start < data.length; start++) {
    for (let finish = start + 1; finish < data.length; finish++) {
      let sum = 0;
      for (let i = start; i <= finish; i++) {
        sum += data[i];
      }
      maxSum = Math.max(maxSum, sum);
      if (maxSum == sum) {
        ns.tprintf("sum of elements from %d (a %d) to %d (a %d; exclusive) is %d", start, data[start], finish, data[finish], sum);
      }
    }
  }
  ns.tprintf("max sum is %d!", maxSum);
  return maxSum;
}
