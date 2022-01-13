import { scanAll } from "util_recurse.js";

/** @param {NS} ns **/
export async function main(ns) {
  const servers = scanAll(ns);
  ns.tprintf("Scanned %d servers", servers.length);
  // ns.tprint(servers);

  let contracts = [];

  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    const files = ns.ls(host);
    if (files.length > 0) {
      ns.tprintf("%s:", host);
    }
    for (let j = 0; j < files.length; j++) {
      ns.tprintf("  %s", files[j]);
      if (files[j].endsWith(".cct")) {
        contracts.push(ns.sprintf("%s:%s", host, files[j]));
      }
    }
  }

  ns.tprintf("contracts:")
  for (let k = 0; k < contracts.length; k++) {
    ns.tprintf("  %s", contracts[k]);
  }
}
