/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("%s", parseInt(formatMem(ns.args[0])));
}

export function formatMem(gb) {
  let cursor = 0;
  const units = ["GB", "TB", "PB", "EB", "ZB", "YB"];
  while (gb >= 1000) {
    gb /= 1000;
    cursor++;
  }
  return "" + gb.toFixed(3) + units[cursor];
}
