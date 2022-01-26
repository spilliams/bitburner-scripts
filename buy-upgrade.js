import { formatMem } from "util_formatMem.js";

// if you don't yet have max servers, it spins up
// new 4gb servers.
// after that, it constantly loops over your purchased servers,
// and doubles their ram if you can afford it.

// args: payload, payload-args

const threshold = 0.1; // don't spend more than this factor of my money at once

/** @param {NS} ns **/
export async function main(ns) {
  let payload = "";
  let args = [];
  if (ns.args.length > 0) payload = ns.args[0];
  if (ns.args.length > 1) args = ns.args.slice(1);
  const limit = ns.getPurchasedServerLimit();
  let i = ns.getPurchasedServers().length;
  while (i < limit) {
    await buyServer(ns, "pserv4-" + i, payload, args);
    i++;
  }

  let servers = ns.getPurchasedServers();
  let fullyUpgraded = 0;

  let j = 0;
  while (fullyUpgraded < servers.length) {
    ns.print(ns.sprintf("upgrading server %s...", servers[j]));
    const upgraded = await upgradeServer(ns, servers[j], payload, args);
    if (!upgraded) fullyUpgraded++;
    ns.print("done");
    j = (j + 1) % servers.length;
    await ns.sleep(1000);
  }
}

/** @param {NS} ns **/
async function buyServer(ns, hostname, payload, args) {
  const ram = 4;

  let money = ns.getServerMoneyAvailable("home");
  let cost = ns.getPurchasedServerCost(ram);

  while (money * threshold < cost) {
    await ns.sleep(10000);
    money = ns.getServerMoneyAvailable("home");
    cost = ns.getPurchasedServerCost(ram);
  }

  hostname = ns.purchaseServer(hostname, ram);

  await runPayload(ns, hostname, ram, payload, args);
}

/** @param {NS} ns **/
async function runPayload(ns, host, hostRAM, payload, args) {
  if (payload == "") return;
  const threads = ((hostRAM / ns.getScriptRam(payload)) * 10) / 10;
  ns.tprintf("scping %s from home to %s", payload, host);
  await ns.scp(payload, "home", host);
  ns.exec(payload, host, threads, ...args);
}

/** @param {NS} ns **/
async function upgradeServer(ns, hostname, payload, args) {
  let currentRAM = ns.getServerMaxRam(hostname);
  let newRAM = currentRAM * 2;
  // validate that newRAM is a power of 2...
  if (newRAM > ns.getPurchasedServerMaxRam()) {
    return false;
  }
  let cost = ns.getPurchasedServerCost(newRAM);
  while (ns.getServerMoneyAvailable("home") * threshold < cost) {
    await ns.sleep(30000);
  }
  ns.toast(ns.sprintf("upgrading %s to %s", hostname, formatMem(newRAM)), "info");
  ns.killall(hostname);
  ns.deleteServer(hostname);
  ns.purchaseServer(hostname, newRAM);

  await runPayload(ns, hostname, newRAM, payload, args);

  return true
}
