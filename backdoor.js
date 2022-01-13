import { scanAll } from "util_recurse.js";

/** @param {NS} ns **/
export async function main(ns) {
  const servers = scanAll(ns);
  const promises = [];

  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    if (!ns.hasRootAccess(host)) {
      continue;
    }

    promises.push(ns.installBackdoor(host));
  }

  await Promise.all(promises);
}
