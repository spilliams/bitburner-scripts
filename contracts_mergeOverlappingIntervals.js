/** @param {NS} ns **/
export async function main(ns) {
  // const data = [[8, 11], [11, 12], [25, 30], [10, 13], [13, 21], [25, 30]];
  // [3,7],[11,13],[11,18],[23,29],[1,3],[2,11] -> [1,18],[23,29] ok!
  const data = [[6, 13], [18, 25], [23, 31], [23, 30], [24, 34], [18, 21], [4, 5], [21, 29]]; // -> [4,13],[18,34] bad!
  const merged = mergeOverlappingIntervals(ns, data);
  ns.tprintf("merged: %v", merged);
  return merged;
}

export function mergeOverlappingIntervals(ns, data) {
  ns.tprintf("data: %v", data);
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
  ns.tprintf("           01234567890123456789012345678901234567890")
  for (let i = 0; i < data.length; i++) {
    const interval = data[i];
    for (let j = interval[0]; j <= interval[1]; j++) {
      merged[j] = 1;
    }
    ns.tprintf("+[%s,%s] = %s", pad(interval[0], 2), pad(interval[1], 2), merged.join(""));
  }

  const mergeStr = "0" + merged.join("") + "0";
  let risingIndex = -1;
  let intervals = [];
  for (let i = 1; i < mergeStr.length; i++) {
    const prev = mergeStr[i - 1];
    const cursor = mergeStr[i];
    if (prev == "0" && cursor == "1") {
      risingIndex = i - 1;
      continue;
    }
    if (prev == "1" && cursor == "0") {
      let fallingIndex = i - 2;
      intervals.push([risingIndex, fallingIndex]);
    }
  }
  return intervals;
}

function pad(num, len, char = "0") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
