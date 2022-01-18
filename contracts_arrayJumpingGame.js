/** @param {NS} ns **/
export async function main(ns) {
  const data = [9, 6, 0, 0, 0, 8, 1, 2, 7, 3, 2, 0, 6, 3, 2, 4, 0, 0, 3, 8, 8, 0, 0, 8, 9];
  const ok = arrayJumpingGame(ns, data);
  ns.tprintf("solvable? %s", ok);
}

export function arrayJumpingGame(ns, data, count = 0) {
  let spaces = "";
  for (let i = 0; i < count; i++) {
    spaces += "  "
  }
  ns.tprintf("%si=%d: [%s]", spaces, count, data.join(", "));
  if (count == 30) {
    ns.tprintf("%s  too deep!", spaces);
    return 0;
  }
  if (data.length <= data[0]) {
    // ns.tprintf("data length %d <= data[0]? %v", data.length, data[0], data.length <= data[0]);
    return 1;
  }
  if (data[0] == 0) return 0;

  // first number is > 0, < length;
  for (let i = 1; i <= data[0]; i++) {

    // ns.tprintf("%s  calling from count %d with start %i", spaces, count, i);
    if (arrayJumpingGame(ns, clone(data.slice(i)), count + 1) == 1) {
      return 1;
    }
  }
  return 0;
}

function clone(arr) {
  let a = [];
  if (arr.length == 0) return a;

  for (let i = 0; i < arr.length; i++) {
    a.push(arr[i]);
  }
  return a;
}
