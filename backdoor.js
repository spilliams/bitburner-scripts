// import { scanAll } from "util_recurse.js";
import { breakIt } from "infect.js";
import { goto } from "alias.js";
import { getNumPortScriptsAvailable } from "target.js";

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("sleep");
  ns.disableLog("getHackingLevel");
  ns.disableLog("scan");

  // const servers = scanAll(ns);
  const servers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]
  let count = 0;

  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    let done = await backdoor(ns, host);
    if (done) count++;
  }

  ns.tprintf("backdoored %d servers", count);
}

/** @param {NS} ns **/
async function backdoor(ns, host) {
  const hackReqd = ns.getServerRequiredHackingLevel(host);
  let printed = false;
  while (ns.getHackingLevel() < hackReqd) {
    ns.tail();
    if (!printed) ns.print(ns.sprintf("can't backdoor %s until you have %d hacking. waiting", host, hackReqd));
    printed = true;
    await ns.sleep(10000);
  }

  if (!ns.hasRootAccess(host)) {
    const bustersReqd = ns.getServerNumPortsRequired();
    printed = false;
    while (getNumPortScriptsAvailable(ns) < bustersReqd) {
      ns.tail();
      if (!printed) ns.print(ns.sprintf("waiting until we have %d port-busters", bustersReqd));
      printed = true;
      await ns.sleep(10000);
    }

    let broken = await breakIt(ns, host);
    if (!broken) {
      ns.tail();
      throw ns.sprintf("can't break %s", host);
    }
  }

  await goto(ns, host);
  await ns.installBackdoor();
  await goto(ns, "home");
  return true;
}
