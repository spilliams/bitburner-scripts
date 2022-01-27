/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("%s", formatNow());
}

export function formatNow() {
  return formatTime(new Date());
}

/** @param {Date} t */
export function formatTime(t) {
  return t.toISOString().split("-").join("").split("T").join("_");
}

/** @param {Number} gigabytes */
export function formatMem(gb) {
  let cursor = 0;
  const units = ["GB", "TB", "PB", "EB", "ZB", "YB"];
  while (gb >= 1000) {
    gb /= 1000;
    cursor++;
  }
  return "" + gb.toFixed(3) + units[cursor];
}

/** @param {Number} dollars **/
export function formatMoney(dollars) {
  const suffixes = ["", "k", "m", "b", "t", "q", "Q"];
  let suffix = 0;
  let left = dollars;
  while (left > 1000) {
    left /= 1000;
    suffix++;
  }
  return "$" + left.toFixed(3) + suffixes[suffix];
}
