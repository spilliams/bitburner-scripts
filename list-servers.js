import { formatMoney } from "util/formatMoney.js";

// lists purchased servers, and their maximum RAM

/** @param {NS} ns **/
export async function main(ns) {
  let servers = ns.getPurchasedServers();
  for (let i = 0; i < servers.length; i++) {
    let ram = ns.getServerMaxRam(servers[i])
    ns.tprintf("%s: %dGB (%s to upgrade)", servers[i], ram, formatMoney(ns.getPurchasedServerCost(ram * 2)));
  }
}
