/** @param {NS} ns **/
export async function main(ns) {
  // form triangle with args? or just use data set...
  const data = [
    // [7],
    // [3, 1],
    // [2, 2, 2],
    // [7, 9, 7, 6],
    // [3, 3, 7, 2, 2],
    // [6, 2, 2, 4, 7, 8],
    // [6, 9, 5, 6, 3, 9, 1],
    // [5, 2, 5, 5, 4, 9, 2, 9],
    // [3, 8, 6, 7, 2, 2, 4, 5, 5],
    // [2, 8, 4, 4, 8, 9, 8, 6, 5, 2]
    [2],
    [3, 4],
    [6, 5, 7],
    [4, 1, 8, 3]
  ];
  ns.tprintf("min is %d", minimumPathSumTriangle(ns, data));
}

/** @param {NS} ns **/
export function minimumPathSumTriangle(ns, data) {
  let sums = [data[0]];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const prevRow = sums[r - 1];
    ns.tprintf("previous row %v", prevRow);
    ns.tprintf("adding row  %v", row);
    let newRow = [];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (c == 0) {
        newRow.push(cell + prevRow[0]);
        continue
      }
      if (c == row.length - 1) {
        newRow.push(cell + prevRow[c - 1]);
        continue
      }
      newRow.push(Math.min(cell + prevRow[c], cell + prevRow[c - 1]));
    }
    ns.tprintf("equals row  %v", row);
    ns.tprintf("---------------------------------------------")
    sums.push(newRow);
  }

  // minimum among last row
  const lastRow = sums[sums.length - 1];
  let min = 10000;
  for (let i = 0; i < lastRow.length; i++) {
    min = Math.min(min, lastRow[i]);
  }
  return min;
}
