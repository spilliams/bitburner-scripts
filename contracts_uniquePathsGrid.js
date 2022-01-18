/** @param {NS} ns **/
export async function main(ns) {
  // ns.tprintf("%d paths", uniquePathsInAGrid1(ns, [5, 11]));
  // const data = [
  //   [0, 0, 0, 0, 0, 1],
  //   [0, 0, 0, 0, 0, 0],
  //   [0, 1, 0, 1, 0, 0],
  //   [0, 0, 0, 0, 0, 1],
  //   [0, 0, 0, 1, 1, 1],
  //   [0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 1, 0]
  // ]; ok!
  const data = [
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0]
  ];
  // const data = [
  //   [0,0,0,0,0,0,1,0,0,0,1],
  //   [0,1,0,0,0,0,0,0,0,0,0],
  //   [0,0,0,1,1,0,0,0,1,0,0],
  //   [0,0,0,0,0,0,0,0,0,0,0],
  //   [0,0,0,0,0,0,1,0,0,1,0],
  //   [1,0,0,0,0,0,1,0,0,0,0],
  //   [0,0,0,0,0,1,0,0,0,0,0],
  //   [0,1,0,0,0,0,0,0,0,0,0],
  //   [0,0,0,0,0,1,1,0,0,0,0],
  //   [0,0,0,0,0,0,0,1,0,0,0]
  // ];
  ns.tprintf("%d paths", uniquePathsInAGrid2(ns, data));
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

export function uniquePathsInAGrid2(ns, data) {
  const rows = data.length;
  const cols = data[0].length;

  ns.tprintf("original grid:\n%s", sprintGrid(data));

  // change 0s to blanks
  // change 1s to 0s
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (data[r][c] === 0) data[r][c] = "";
      if (data[r][c] === 1) {
        data[r][c] = 0;
        continue;
      }
    }
  }
  data[0][0] = 1;

  ns.tprintf("after cleaning:\n%s", sprintGrid(data));

  // first row, first col
  for (let c = 1; c < cols; c++) {
    if (data[0][c] === 0) continue;
    data[0][c] = data[0][c - 1];
  }
  for (let r = 1; r < rows; r++) {
    if (data[r][0] === 0) continue;
    data[r][0] = data[r - 1][0];
  }

  ns.tprintf("after initializing:\n%s", sprintGrid(data));

  // now count em!
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (data[r][c] === 0) continue;
      data[r][c] = parseInt(data[r - 1][c] + data[r][c - 1]);
    }
  }
  ns.tprintf("final grid:\n%s", sprintGrid(data));

  return data[rows - 1][cols - 1];
}

function sprintGrid(data) {
  const rows = data.length;
  const cols = data[0].length;
  const max = data[rows - 1][cols - 1];
  let padLength = ("" + max).length + 1;
  padLength = Math.max(2, padLength + 1);

  let lines = [];

  for (let r = 0; r < rows; r++) {
    let rowS = "";
    for (let c = 0; c < cols; c++) {
      rowS += pad(data[r][c], padLength);
    }
    lines.push(rowS);
  }

  return lines.join("\n");
}

function pad(num, len, char = " ") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
