/** @param {NS} ns **/
export async function main(ns) {
  const data = [[8, 11], [11, 12], [25, 30], [10, 13], [13, 21], [25, 30]];
  const merged = mergeOverlappingIntervals(ns, data);
  ns.tprintf("[ [%v] ]", merged.join("], ["));
  return merged;
}

export function mergeOverlappingIntervals(ns, data) {
  let length = 0;
  // how long should the merged array be?
  for (let i = 0; i < data.length; i++) {
    const interval = data[i];
    length = Math.max(length, interval[1]);
  }
  // construct an empty array, with extra space
  let merged = [];
  for (let i = 0; i < length + 2; i++) {
    merged.push(0);
  }

  // for each interval, fill in the merged array
  for (let i = 0; i < data.length; i++) {
    const interval = data[i];
    ns.tprintf("considering interval %v", interval);
    for (let j = interval[0]; j <= interval[1]; j++) {
      merged[j] = 1;
    }
    ns.tprintf("  merged is now %v", merged);
  }

  const ones = merged.split(/0+/);
  const zeroes = merged.split(/1+/);
  ns.tprintf("ones: %v", ones);
  ns.tprintf("zeroes: %v", zeroes);
  return false;
}
