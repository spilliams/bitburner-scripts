import { formatMoney, formatMem } from "util_format.js";

// lists purchased servers, and their maximum RAM

/** @param {NS} ns **/
export async function main(ns) {
  const fullRAM = ns.getPurchasedServerMaxRam();
  let servers = ns.getPurchasedServers();
  for (let i = 0; i < servers.length; i++) {
    let ram = ns.getServerMaxRam(servers[i])

    let upgradeS = "(fully upgraded)";
    if (ram * 2 < fullRAM) {
      upgradeS = ns.sprintf("(%s to upgrade)", formatMoney(ns.getPurchasedServerCost(ram * 2)));
    }

    ns.tprintf("%s: %s %s", servers[i], formatMem(ram), upgradeS);
  }
}
