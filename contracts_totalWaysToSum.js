/** @param {NS} ns **/
export async function main(ns) {
  const ways = totalWaysToSum(ns, ns.args[0], true);
  ns.tprintf("total ways to sum %d: %d", ns.args[0], ways.length);
}

/** @param {NS} ns **/
export function totalWaysToSum(ns, n, debug = false) {
  // if (debug) ns.tprintf("WAYS TO SUM %v", n);
  if (typeof n != "number" || n < 2) {
    throw ns.sprintf("tried to count the ways to sum %v, which I don't know how to do", n);
  }
  if (n == 2) {
    if (debug) ns.tprintf("1 + 1");
    if (debug) ns.tprintf("DONE WITH WAYS TO SUM %d", n);
    return [[1, 1]];
  }

  const priorWays = totalWaysToSum(ns, n - 1, false);
  // clone, and increment each term in each way!
  let list = [];
  for (let i = 0; i < priorWays.length; i++) {
    for (let j = 0; j < priorWays[i].length; j++) {
      let newWay = copy(priorWays[i]);
      newWay[j]++;
      list.push(newWay);
    }
  }
  // clone, and add a new 1 term to each way
  for (let i = 0; i < priorWays.length; i++) {
    let newWay = copy(priorWays[i]);
    newWay.push(1);
    list.push(newWay);
  }
  // add a new way for prior+1
  list.push([n - 1, 1]);

  // sort each way
  for (let i = 0; i < list.length; i++) {
    list[i].sort(sortNumsDesc);
  }
  list.sort(sortArrNumsAsc);

  // if (debug) {
  // 	ns.tprintf("before dedupe:");
  // 	for (let i = 0; i < list.length; i++) {
  // 		ns.tprintf("%s", list[i].join(" + "));
  // 	}
  // }

  // dedupe the list of ways
  list = dedupe(ns, list);

  if (debug) {
    // ns.tprintf("after dedupe:");
    for (let i = 0; i < list.length; i++) {
      ns.tprintf("%s", list[i].join(" + "));
    }
  }
  // ns.tprintf("DONE WITH WAYS TO SUM %d", n);
  return list
}

function sortNumsDesc(a, b) {
  return b - a;
}

function sortArrNumsAsc(a, b) {
  const minL = Math.min(a.length, b.length);
  for (let i = 0; i < minL; i++) {
    if (a[i] != b[i]) {
      return a[i] - b[i];
    }
  }
  if (a.length > b.length) {
    return 1;
  } else if (b.length > a.length) {
    return -1;
  }
  return 0;
}

function copy(nArr) {
  let newArr = [];
  for (let i = 0; i < nArr.length; i++) {
    newArr.push(nArr[i]);
  }
  return newArr;
}

function dedupe(ns, arr) {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    // ns.tprintf("deduping %v", arr[i]);
    if (!includes(ns, newArr, arr[i])) {
      newArr.push(arr[i]);
    }
    // if (!newArr.includes(arr[i])) {
    // 	newArr.push(arr[i]);
    // }
  }
  return newArr;
}

function includes(ns, nArrArr, nArr) {
  const check = copy(nArr).sort();
  for (let i = 0; i < nArrArr.length; i++) {
    const against = copy(nArrArr[i]).sort();
    if (check.length != against.length) {
      continue;
    }

    let lettersMatch = true;
    for (let j = 0; j < check.length; j++) {
      if (check[j] != against[j]) {
        lettersMatch = false;
        break;
      }
    }
    if (lettersMatch) {
      return true;
    }
  }
  return false;
}
