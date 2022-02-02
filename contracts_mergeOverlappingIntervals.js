import { pad } from "util_format.js";

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
    merged.push("0");
    merged.push(" ");
  }
  merged.push("0");

  // for each interval, fill in the merged array
  ns.tprintf("             0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0")
  for (let i = 0; i < data.length; i++) {
    const interval = data[i];
    const mergeStart = (interval[0] + 1) * 2;
    const mergeEnd = (interval[1] + 1) * 2;
    for (let j = mergeStart; j <= mergeEnd; j++) {
      merged[j] = "1";
    }
    ns.tprintf("+[%s,%s] = %s", pad(interval[0], 2, "0"), pad(interval[1], 2, "0"), merged.join(""));
  }

  const mergeStr = "0" + merged.join("") + "0";
  let risingIndex = -1;
  let intervals = [];
  for (let i = 1; i < mergeStr.length; i++) {
    const prev = mergeStr[i - 1];
    const cursor = mergeStr[i];
    if (cursor == "1" && (prev == "0" || prev == " ")) {
      risingIndex = i - 1;
      continue;
    }
    if (prev == "1" && (cursor == "0" || cursor == " ")) {
      let fallingIndex = i - 2;
      intervals.push([(risingIndex / 2) - 1, (fallingIndex / 2) - 1]);
    }
  }
  return intervals;
}
