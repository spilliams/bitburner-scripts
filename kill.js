import { scanAll } from "util/recurse.js";

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length != 1) {
    ns.tprint("requires 1 arg: script to kill");
    return;
  }

  const scanning = scanAll(ns);
  ns.tprintf("done! scanned %d servers", scanning.length);

  for (let i = 0; i < scanning.length; i++) {
    const host = scanning[i];
    if (ns.scriptKill(ns.args[0], host)) {
      ns.tprintf("killed %s on %s", ns.args[0], host);
    }
  }
}
