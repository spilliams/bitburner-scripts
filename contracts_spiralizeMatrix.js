/** @param {NS} ns **/
export async function main(ns) {
  // [
  //     [1,  2,  3,  4]
  //     [5,  6,  7,  8]
  //     [9, 10, 11, 12]
  // ]

  // Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
  const unwrapped = spiralizeMatrix(ns, [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
  ns.tprintf("%v", unwrapped);
  return unwrapped;
}

export function spiralizeMatrix(ns, data) {
  ns.tprintf("original input: %s", sprint2D(ns, data));

  let arr = clone(data);
  let unwrapped = [];
  while (arr.length > 0) {
    const result = removeRow(arr);
    const row = result[0];
    arr = result[1];
    ns.tprintf("after removing a row.\nresult: %s\nrow: [%s]", sprint2D(ns, arr), row.join(", "));
    ns.tprintf("%v", row);
    unwrapped.push(row);
    if (arr.length == 0) break;
    arr = rotateCCW(ns, arr);
    ns.tprintf("after rotating: %s", sprint2D(ns, arr));
  }
  return unwrapped.flat();
}

function removeRow(data) {
  return [clone(data[0]), data.splice(1)];
}

function clone(arr) {
  let a = [];
  if (arr.length == 0) return a;

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      a.push(clone(arr[i]));
    } else {
      a.push(arr[i]);
    }
  }
  return a;
}

function rotateCCW(ns, arr) {
  // [
  //     [1,  2,  3,  4]
  //     [5,  6,  7,  8]
  //     [9, 10, 11, 12]
  // ]
  // [
  //     [4, 8, 12]
  //     [3, 7, 11]
  //     [2, 6, 10]
  //     [1, 5,  9]
  // ]
  const oldHeight = arr.length;
  const oldWidth = arr[0].length;
  let rotated = [];
  for (let x = oldWidth - 1; x >= 0; x--) {
    let row = [];
    for (let y = 0; y < oldHeight; y++) {
      ns.tprintf("(%d,%d) %v", y, x, arr[y][x]);
      row.push(arr[y][x]);
    }
    rotated.push(row);
  }
  return rotated;
}

function sprint2D(ns, arr) {
  let str = "[\n";
  for (let i = 0; i < arr.length; i++) {
    str += ns.sprintf("\t[%s],\n", arr[i].join(", "));
  }
  str += "]";
  return str;
}
