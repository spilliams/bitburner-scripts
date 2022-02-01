// import { scanAll } from "util_recurse.js";
import { breakIt } from "infect.js";

/** @param {NS} ns **/
export async function main(ns) {
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
  if (ns.getHackingLevel() < hackReqd) {
    ns.tprintf("can't backdoor %s until hou have %d hacking", host, hackReqd);
    return false;
  }

  if (!ns.hasRootAccess(host)) {
    let broken = await breakIt(ns, host);
    if (!broken) {
      ns.tprintf("can't break %s", host);
      return false;
    }
  }

  await ns.installBackdoor(host);
  ns.tprintf("backdoored %s", host);
  return true;
}
