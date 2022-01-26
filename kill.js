import { scanAll } from "util_recurse.js";

/** @param {NS} ns **/
export async function main(ns) {
  let scriptToKill = "all";
  if (ns.args.length == 1) {
    scriptToKill = ns.args[0];
  }

  const scanning = scanAll(ns);
  ns.tprintf("done! scanned %d servers", scanning.length);

  for (let i = 0; i < scanning.length; i++) {
    const host = scanning[i];
    if (host === "home") {
      continue;
    }
    if (scriptToKill === "all" && ns.killall(host)) {
      ns.tprintf("killed all on %s", host);
    } else if (ns.scriptKill(ns.args[0], host)) {
      ns.tprintf("killed %s on %s", ns.args[0], host);
    }
  }
}
