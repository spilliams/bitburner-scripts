// (remember: this is a payload. no imports)

// weaken/grow/hack script
// args: target

const toasty = false;
const securityLevelBuffer = 5; // when they're soft enough to hack
const moneyThreshold = 0.75;   // when they're fat enough to hack

/** @param {NS} ns **/
export async function main(ns) {
  const hostname = ns.getHostname();
  const target = ns.args[0];
  let securityThreshold = ns.getServerMinSecurityLevel(target) + securityLevelBuffer;
  let minMoney = ns.getServerMaxMoney(target) * moneyThreshold;
  while (true) {
    let level = ns.getServerSecurityLevel(target);
    if (level > securityThreshold) {
      ns.print("security level is ", level.toFixed(2), " (over threshold ", securityThreshold.toFixed(2), "). weakening");
      await ns.weaken(target);
      if (toasty) ns.toast(ns.sprintf("%s: weaken %s complete", hostname, target));
      continue;
    }
    let serverMoney = ns.getServerMoneyAvailable(target);
    if (serverMoney < minMoney) {
      ns.print("server money is ", formatMoney(serverMoney), " (under threshold ", formatMoney(moneyThreshold), "). growing");
      await ns.grow(target);
      if (toasty) ns.toast(ns.sprintf("%s: grow %s complete", hostname, target));
      continue;
    }
    await ns.hack(target);
    if (toasty) ns.toast(ns.sprintf("%s: H4CK %s complete", hostname, target));
  }
}

/** @param {Number} dollars **/
export function formatMoney(dollars) {
  const suffixes = ["", "k", "m", "b", "t", "q"];
  let suffix = 0;
  let left = dollars;
  while (left > 1000) {
    left /= 1000;
    suffix++;
  }
  return "$" + left.toFixed(3) + suffixes[suffix];
}
