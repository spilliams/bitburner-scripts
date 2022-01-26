/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("%f: %s", ns.args[0], formatMoney(ns.args[0]))
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
