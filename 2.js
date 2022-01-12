import { formatMoney } from "util/formatMoney.js";

// weaken/grow/hack script
// args: target

/** @param {NS} ns **/
export async function main(ns) {
  var target = ns.args[0];
  var moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  var securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
  while (true) {
    let level = ns.getServerSecurityLevel(target);
    if (level > securityThreshold) {
      ns.print("security level is ", level.toFixed(2), " (over threshold ", securityThreshold.toFixed(2), "). weakening");
      await ns.weaken(target);
      continue;
    }
    let serverMoney = ns.getServerMoneyAvailable(target);
    if (serverMoney < moneyThreshold) {
      ns.print("server money is ", formatMoney(serverMoney), " (under threshold ", formatMoney(moneyThreshold), "). growing");
      await ns.grow(target);
      continue;
    }

    await ns.hack(target);
  }
}
