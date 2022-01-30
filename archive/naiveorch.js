import { takeIt } from "infect.js";
import { topTargets } from "target.js";

/** @param {NS} ns **/
export async function main(ns) {
  const payload = "2.js";

  let targets = topTargets(ns);
  let servers = ns.getPurchasedServers();
  let len = Math.min(targets.hackable.length, servers.length);
  let sumThreads = 0;
  for (let i = 0; i < len; i++) {
    let target = targets.hackable[i]["hostname"];
    let threads = await takeIt(ns, servers[i], payload, [target]);
    ns.tprintf("started %d threads on %s, targeting %s", threads, servers[i], target)
    sumThreads += threads;
  }
  ns.tprintf("total threads running: %d", sumThreads);
}
