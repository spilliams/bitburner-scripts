/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("%d paths", uniquePathsInAGrid1(ns, [5, 11]));
}

export function uniquePathsInAGrid1(ns, data) {
  const rows = data[0];
  const cols = data[1];
  ns.tprintf("%d by %d grid", rows, cols);

  let grid = [];
  // "empty" (anything not in first row/col will be overwritten anyway)
  for (let r = 0; r < rows; r++) {
    let newRow = [];
    for (let c = 0; c < cols; c++) {
      newRow.push(1);
    }
    grid.push(newRow);
  }
  grid[0][0] = 0; // for pretty-printing

  // now count em!
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      grid[r][c] = grid[r - 1][c] + grid[r][c - 1];
    }
  }

  const max = grid[rows - 1][cols - 1];
  const padLength = ("" + max).length + 1;

  for (let r = 0; r < rows; r++) {
    let rowS = "";
    for (let c = 0; c < cols; c++) {
      rowS += pad(grid[r][c], padLength);
    }
    ns.tprintf("%s", rowS);
  }

  return max;
}

// export function uniquePathsInAGrid2(ns, data, x = 0, y = 0) {
//   const targetX = data[0].length - 1;
//   const targetY = data.length - 1;


// }

function pad(num, len, char = " ") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
